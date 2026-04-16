import { NextResponse } from "next/server";
import { z } from "zod";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { generateResetToken, hashTokenSHA256 } from "@/utils/otp";
import { sendPasswordResetEmail } from "@/lib/resend";

const forgotSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = forgotSchema.safeParse(body);

    if (!parsed.success) {
      // Always return success to not reveal email existence
      return NextResponse.json({ success: true }, { status: 200 });
    }

    await connectToDatabase();

    const user = await UserModel.findOne({ email: parsed.data.email }).lean();

    // Only send reset email if user exists, is verified, and has a password (not Google OAuth)
    if (user && user.isVerified && user.passwordHash) {
      try {
        const resetToken = generateResetToken();
        const hashedToken = hashTokenSHA256(resetToken);
        const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        await UserModel.updateOne(
          { _id: user._id },
          {
            $set: {
              passwordResetToken: hashedToken,
              passwordResetTokenExpiry: tokenExpiry,
            },
          }
        );

        const resetUrl = `${process.env.NEXTAUTH_URL || "https://staydue.app"}/reset-password?token=${resetToken}`;

        await sendPasswordResetEmail(parsed.data.email, user.name, resetUrl);
      } catch (error) {
        console.error("[forgot-password/email]", error);
        // Still return success to not reveal if email was sent
      }
    }

    // Always return success
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[forgot-password]", error);
    // Always return success to not reveal errors
    return NextResponse.json({ success: true }, { status: 200 });
  }
}
