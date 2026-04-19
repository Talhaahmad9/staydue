import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase, SubscriptionModel, DiscountCodeModel, UserModel } from "@/lib/mongodb";
import { sendNewPaymentAlertEmail } from "@/lib/resend";
import { uploadScreenshot } from "@/lib/r2";
import { z } from "zod";

const schema = z.object({
  plan: z.enum(["monthly", "semester"]),
  transactionId: z.string().trim().min(4).max(100),
  paymentMethod: z.string().trim().min(2).max(50),
  discountCode: z.string().trim().toUpperCase().optional(),
});

const BASE_AMOUNTS: Record<string, number> = {
  monthly: 300,
  semester: 1000,
};

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const existing = await SubscriptionModel.findOne({
      userId: session.user.id,
      status: { $in: ["pending", "active"] },
    }).lean();
    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending or active subscription" },
        { status: 409 }
      );
    }

    const formData = await req.formData();

    const plan = formData.get("plan") as string | null;
    const transactionId = formData.get("transactionId") as string | null;
    const paymentMethod = formData.get("paymentMethod") as string | null;
    const discountCode = formData.get("discountCode") as string | null;
    const screenshot = formData.get("screenshot") as File | null;

    if (!screenshot || !ALLOWED_IMAGE_TYPES.includes(screenshot.type)) {
      return NextResponse.json(
        { error: "Please upload a valid image (JPEG, PNG, or WebP)" },
        { status: 400 }
      );
    }

    const MAX_SCREENSHOT_SIZE = 5 * 1024 * 1024; // 5MB
    if (screenshot.size > MAX_SCREENSHOT_SIZE) {
      return NextResponse.json(
        { error: "Screenshot must be under 5MB" },
        { status: 400 }
      );
    }

    const result = schema.safeParse({
      plan,
      transactionId,
      paymentMethod,
      discountCode: discountCode ?? undefined,
    });
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let finalAmount = BASE_AMOUNTS[result.data.plan];

    if (result.data.discountCode) {
      const now = new Date();

      // Single atomic operation: validate all conditions AND increment usage count
      // This prevents race conditions where two concurrent requests both pass validation
      const updated = await DiscountCodeModel.findOneAndUpdate(
        {
          code: result.data.discountCode,
          isActive: true,
          applicablePlans: result.data.plan,
          $and: [
            { $or: [{ validFrom: { $exists: false } }, { validFrom: null }, { validFrom: { $lte: now } }] },
            { $or: [{ validUntil: { $exists: false } }, { validUntil: null }, { validUntil: { $gte: now } }] },
            { $or: [{ maxUses: null }, { $expr: { $lt: ["$usedCount", "$maxUses"] } }] },
          ],
        },
        { $inc: { usedCount: 1 } },
        { new: true }
      );
      if (!updated) {
        return NextResponse.json({ error: "Discount code is no longer valid" }, { status: 400 });
      }
      finalAmount = Math.max(0, BASE_AMOUNTS[result.data.plan] - updated.discountValue);
    }

    const arrayBuffer = await screenshot.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const uploadResult = await uploadScreenshot(buffer, screenshot.name, screenshot.type, session.user.id);
    if (!uploadResult.success || !uploadResult.key) {
      return NextResponse.json(
        { error: "Failed to upload screenshot. Please try again." },
        { status: 500 }
      );
    }

    await SubscriptionModel.create({
      userId: session.user.id,
      plan: result.data.plan,
      transactionId: result.data.transactionId,
      paymentMethod: result.data.paymentMethod,
      amount: finalAmount,
      currency: "PKR",
      screenshotKey: uploadResult.key,
      status: "pending",
      startDate: null,
      endDate: null,
      reviewedAt: null,
      reviewedBy: null,
      rejectionReason: null,
    });

    // Fire-and-forget admin alert — never throws
    const adminEmail = (process.env.ADMIN_EMAILS ?? "").split(",")[0].trim();
    if (adminEmail) {
      UserModel.findById(session.user.id)
        .select("name email")
        .lean()
        .then((u) => {
          const name = (u as { name?: string } | null)?.name ?? "Unknown";
          const email = (u as { email?: string } | null)?.email ?? "";
          return sendNewPaymentAlertEmail(adminEmail, name, email, result.data.plan, finalAmount, result.data.transactionId);
        })
        .catch((e: unknown) => console.error("[subscription/submit/alert-email]", e));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[subscription/submit]", error);
    return NextResponse.json(
      { error: "Could not submit subscription request" },
      { status: 500 }
    );
  }
}
