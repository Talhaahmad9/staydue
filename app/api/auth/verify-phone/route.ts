import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase, UserModel, RetrialAttemptModel } from "@/lib/mongodb";
import { verifyOtp } from "@/utils/otp";
import { sendTrialStartedEmail } from "@/lib/resend";

const schema = z.object({
  otp: z.string().length(6).regex(/^\d+$/),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id)
      .select("isPhoneVerified phone phoneOtp phoneOtpExpiry")
      .lean();
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.isPhoneVerified === true) {
      return NextResponse.json(
        { error: "Phone number is already verified" },
        { status: 403 }
      );
    }

    if (!user.phone) {
      return NextResponse.json(
        { error: "No phone number found. Please enter your phone number first." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (!user.phoneOtpExpiry || user.phoneOtpExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const isValid = await verifyOtp(result.data.otp, user.phoneOtp || "");
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid verification code. Please try again." },
        { status: 400 }
      );
    }

    const phoneAlreadyUsed = await UserModel.findOne({
      trialPhoneNumber: user.phone,
      _id: { $ne: session.user.id },
    }).lean();

    const now = new Date();
    const trialStartedAt = phoneAlreadyUsed
      ? new Date(now.getTime() - 31 * 24 * 60 * 60 * 1000) // already expired
      : now; // fresh trial

    if (phoneAlreadyUsed) {
      RetrialAttemptModel.create({
        phone: user.phone,
        attemptedByUserId: session.user.id,
        originalUserId: phoneAlreadyUsed._id,
      }).catch((err: unknown) => console.error("[auth/retrial-log]", err));
    }

    await UserModel.updateOne(
      { _id: session.user.id },
      {
        $set: {
          isPhoneVerified: true,
          trialPhoneNumber: user.phone,
          trialStartedAt,
        },
        $unset: { phoneOtp: "", phoneOtpExpiry: "" },
      }
    );

    // Fire-and-forget trial welcome email — only when trial is genuinely fresh
    if (!phoneAlreadyUsed && session.user.email) {
      const trialEndsAt = new Date(trialStartedAt.getTime() + 30 * 24 * 60 * 60 * 1000);
      sendTrialStartedEmail(session.user.email, session.user.name ?? "there", trialEndsAt)
        .catch((e: unknown) => console.error("[auth/verify-phone/trial-email]", e));
    }

    return NextResponse.json({
      success: true,
      trialActive: !phoneAlreadyUsed,
    });
  } catch (error) {
    console.error("[auth/verify-phone]", error);
    return NextResponse.json(
      { error: "Could not verify your phone number. Please try again." },
      { status: 500 }
    );
  }
}
