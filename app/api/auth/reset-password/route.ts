import { NextResponse } from "next/server";
import { z } from "zod";
import { hash } from "bcryptjs";

import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { verifyToken } from "@/utils/otp";

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

    // Find users with valid reset tokens
    const users = await UserModel.find({
      passwordResetTokenExpiry: { $gt: new Date() },
    }).lean();

    let matchedUser = null;
    for (const user of users) {
      if (user.passwordResetToken && await verifyToken(parsed.data.token, user.passwordResetToken)) {
        matchedUser = user;
        break;
      }
    }

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
