import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { sanitizeString } from "@/utils/sanitize";
import { registerInputSchema } from "@/utils/validate";
import { generateOtp, hashOtp } from "@/utils/otp";
import { sendOtpEmail } from "@/lib/resend";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = registerInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid signup input.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const existingUser = await UserModel.findOne({ email: parsed.data.email }).lean();
    if (existingUser) {
      return NextResponse.json(
        { error: "An account already exists for this email.", code: "EMAIL_IN_USE" },
        { status: 409 }
      );
    }

    const passwordHash = await hash(parsed.data.password, 12);

    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await UserModel.create({
      name: sanitizeString(parsed.data.name, 50),
      email: parsed.data.email,
      passwordHash,
      timezone: "Asia/Karachi",
      hasCompletedOnboarding: false,
      isVerified: false,
      verificationOtp: hashedOtp,
      verificationOtpExpiry: otpExpiry,
    });

    // Send OTP email
    await sendOtpEmail(parsed.data.email, parsed.data.name, otp);

    return NextResponse.json(
      { success: true, requiresVerification: true },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      {
        error: "Could not create your account right now. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
