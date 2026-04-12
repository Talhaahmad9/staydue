import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { connectToDatabase, UserModel } from "@/lib/mongodb";
import { generateOtp, hashOtp } from "@/utils/otp";
import { sendOtpEmail } from "@/lib/resend";

const schema = z.object({
  phone: z.string().regex(/^\+92[0-9]{10}$/, "Invalid Pakistani phone number"),
});

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id)
      .select("isPhoneVerified email name")
      .lean();
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.isPhoneVerified === true) {
      return NextResponse.json(
        { error: "Phone number cannot be changed after verification" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await UserModel.updateOne(
      { _id: session.user.id },
      {
        $set: {
          phone: result.data.phone,
          phoneOtp: hashedOtp,
          phoneOtpExpiry: expiry,
        },
      }
    );

    const emailResult = await sendOtpEmail(user.email, user.name, otp);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Could not send verification code. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth/send-phone-otp]", error);
    return NextResponse.json(
      { error: "Could not send verification code. Please try again." },
      { status: 500 }
    );
  }
}
