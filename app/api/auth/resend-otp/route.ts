import { NextResponse } from "next/server";
import { z } from "zod";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { generateOtp, hashOtp } from "@/utils/otp";
import { sendOtpEmail } from "@/lib/resend";

const resendSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = resendSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: parsed.data.email }).lean();
    if (!user) {
      // Don't reveal if email exists
      return NextResponse.json(
        { error: "Invalid email address." },
        { status: 400 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { error: "Email already verified." },
        { status: 400 }
      );
    }

    // Check if OTP was sent recently (less than 60 seconds ago)
    if (user.verificationOtpExpiry) {
      const timeSinceExpiry = new Date().getTime() - user.verificationOtpExpiry.getTime();
      const totalOtpLifetime = 10 * 60 * 1000; // 10 minutes
      const timeSinceSent = totalOtpLifetime + timeSinceExpiry;

      if (timeSinceSent < 60 * 1000) {
        const secondsRemaining = Math.ceil((60 * 1000 - timeSinceSent) / 1000);
        return NextResponse.json(
          {
            error: `Please wait before requesting a new OTP.`,
            secondsRemaining,
          },
          { status: 429 }
        );
      }
    }

    // Generate new OTP
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: {
          verificationOtp: hashedOtp,
          verificationOtpExpiry: otpExpiry,
        },
      }
    );

    // Send OTP email
    await sendOtpEmail(parsed.data.email, user.name, otp);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[resend-otp]", error);
    return NextResponse.json(
      { error: "Could not resend OTP. Please try again." },
      { status: 500 }
    );
  }
}
