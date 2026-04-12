import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase, DiscountCodeModel } from "@/lib/mongodb";
import { z } from "zod";

const schema = z.object({
  code: z.string().trim().min(1).max(50).toUpperCase(),
  plan: z.enum(["monthly", "semester"]),
});

const BASE_AMOUNTS: Record<string, number> = {
  monthly: 300,
  semester: 1000,
};

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = (await req.json()) as Record<string, unknown>;
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const { code, plan } = result.data;

    const discountCode = await DiscountCodeModel.findOne({ code }).lean();
    if (!discountCode) {
      return NextResponse.json({ error: "Invalid discount code" }, { status: 404 });
    }

    const now = new Date();

    if (!discountCode.isActive) {
      return NextResponse.json({ error: "This discount code is no longer active" }, { status: 400 });
    }
    if (discountCode.validFrom && now < discountCode.validFrom) {
      return NextResponse.json({ error: "This discount code is not yet valid" }, { status: 400 });
    }
    if (discountCode.validUntil && now > discountCode.validUntil) {
      return NextResponse.json({ error: "This discount code has expired" }, { status: 400 });
    }
    if (discountCode.maxUses !== null && discountCode.usedCount >= discountCode.maxUses) {
      return NextResponse.json({ error: "This discount code has reached its usage limit" }, { status: 400 });
    }
    if (!discountCode.applicablePlans.includes(plan)) {
      return NextResponse.json({ error: "This discount code does not apply to the selected plan" }, { status: 400 });
    }

    const baseAmount = BASE_AMOUNTS[plan];
    const discountedAmount = Math.max(0, baseAmount - discountCode.discountValue);

    return NextResponse.json({
      success: true,
      discountValue: discountCode.discountValue,
      originalAmount: baseAmount,
      finalAmount: discountedAmount,
      code: discountCode.code,
    });
  } catch (error) {
    console.error("[subscription/validate-code]", error);
    return NextResponse.json(
      { error: "Could not validate discount code" },
      { status: 500 }
    );
  }
}
