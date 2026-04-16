import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { z } from "zod";

const optionalPhoneSchema = z
  .string()
  .regex(/^\+92[0-9]{10}$/)
  .optional();

export async function PATCH(req: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const body = await req.json() as Record<string, unknown>;

    // Handle email enabled toggle
    if ("emailEnabled" in body) {
      const emailSchema = z.object({ emailEnabled: z.boolean() });
      const result = emailSchema.safeParse({ emailEnabled: body.emailEnabled });
      if (!result.success) {
        return NextResponse.json({ error: "Invalid emailEnabled value" }, { status: 400 });
      }

      await UserModel.findByIdAndUpdate(session.user.id, {
        "notificationPreferences.emailEnabled": result.data.emailEnabled,
      });

      return NextResponse.json({ success: true });
    }

    // Handle reminder intervals
    if ("reminderIntervals" in body) {
      const intervalsSchema = z.object({
        reminderIntervals: z.array(z.enum(["3-day", "1-day", "day-of"])),
      });
      const result = intervalsSchema.safeParse({ reminderIntervals: body.reminderIntervals });
      if (!result.success) {
        return NextResponse.json({ error: "Invalid reminder intervals" }, { status: 400 });
      }

      await UserModel.findByIdAndUpdate(session.user.id, {
        "notificationPreferences.reminderIntervals": result.data.reminderIntervals,
      });

      return NextResponse.json({ success: true });
    }

    // Handle phone update
    if ("phone" in body) {
      const phoneResult = optionalPhoneSchema.safeParse(body.phone);
      if (!phoneResult.success) {
        return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
      }

      const user = await UserModel.findById(session.user.id).lean();
      if (user?.isPhoneVerified) {
        return NextResponse.json(
          { error: "Phone number cannot be changed after verification. Contact support for assistance." },
          { status: 403 }
        );
      }

      await UserModel.findByIdAndUpdate(session.user.id, { phone: phoneResult.data });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  } catch (error) {
    console.error("[settings/notifications]", error);
    return NextResponse.json(
      { error: "Could not update notification settings" },
      { status: 500 }
    );
  }
}
