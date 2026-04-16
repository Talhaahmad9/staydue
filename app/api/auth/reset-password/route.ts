import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { hashTokenSHA256 } from "@/utils/otp";

const resetSchema = z.object({
  token: z.string().length(64, "Invalid reset token").regex(/^[a-f0-9]+$/, "Invalid token format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const parsed = resetSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request." },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const hashedToken = hashTokenSHA256(parsed.data.token);
    const matchedUser = await UserModel.findOne({
      passwordResetToken: hashedToken,
      passwordResetTokenExpiry: { $gt: new Date() },
    }).lean();

    if (!matchedUser) {
      return NextResponse.json(
        { error: "Invalid or expired reset link." },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await hash(parsed.data.password, 12);

    // Update user
    await UserModel.updateOne(
      { _id: matchedUser._id },
      {
        $set: { passwordHash },
        $unset: { passwordResetToken: "", passwordResetTokenExpiry: "" },
      }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("[reset-password]", error);
    return NextResponse.json(
      { error: "Could not reset your password. Please try again." },
      { status: 500 }
    );
  }
}
