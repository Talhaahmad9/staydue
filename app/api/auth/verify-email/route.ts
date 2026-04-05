import { NextResponse } from "next/server";
import { z } from "zod";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { verifyOtp } from "@/utils/otp";

const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must contain only digits"),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = verifySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid verification input." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: parsed.data.email }).lean();
    if (!user) {
      return NextResponse.json(
        { error: "User not found." },
        { status: 400 }
      );
    }

    // Check if OTP has expired
    if (!user.verificationOtpExpiry || user.verificationOtpExpiry < new Date()) {
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOtp = await verifyOtp(parsed.data.otp, user.verificationOtp || "");
    if (!isValidOtp) {
      return NextResponse.json(
        { error: "Invalid OTP. Please try again." },
        { status: 400 }
      );
    }

    // Update user to mark as verified
    await UserModel.updateOne(
      { _id: user._id },
      {
        $set: { isVerified: true },
        $unset: { verificationOtp: "", verificationOtpExpiry: "" },
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[verify-email]", error);
    return NextResponse.json(
      { error: "Could not verify your email. Please try again." },
      { status: 500 }
    );
  }
}
