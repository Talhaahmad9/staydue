import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectToDatabase, UserModel } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { sendReminderEmail } from "@/lib/resend";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { buildTestNotificationPayload } from "@/lib/notifications-send";

export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const payload = await buildTestNotificationPayload(
      user._id.toString(),
      user.name || "Student",
      user.email
    );
    if (!payload) {
      return NextResponse.json({ error: "No upcoming deadlines found" }, { status: 404 });
    }

    const emailResult = await sendReminderEmail(payload);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send reminder" },
        { status: 500 }
      );
    }

    let whatsappPhone: string | undefined;
    if (user.phone) {
      const whatsappResult = await sendWhatsAppMessage(payload, user.phone, true);
      if (whatsappResult.success) {
        whatsappPhone = whatsappResult.maskedPhone;
      }
    }

    return NextResponse.json({
      success: true,
      sentTo: user.email,
      whatsappPhone,
      deadline: payload.deadline.title,
    });
  } catch (error) {
    console.error("[test-notify]", error instanceof Error ? error.message : String(error));
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
