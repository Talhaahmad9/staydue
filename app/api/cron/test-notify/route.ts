import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { connectToDatabase, UserModel, DeadlineModel } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { sendReminderDigestEmail } from "@/lib/resend";
import { sendWhatsAppBatchReminder } from "@/lib/whatsapp";
import { BatchNotificationPayload } from "@/types/notification";

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

    const upcomingDeadlines = await DeadlineModel.find({
      userId: user._id,
      status: "upcoming",
      isCompleted: false,
      dueDate: { $gt: new Date() },
    })
      .sort({ dueDate: 1 })
      .limit(5)
      .lean();

    if (upcomingDeadlines.length === 0) {
      return NextResponse.json(
        { error: "No upcoming deadlines found" },
        { status: 404 },
      );
    }

    const batch: BatchNotificationPayload = {
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.name || "Student",
      deadlines: upcomingDeadlines.map((d) => ({
        deadlineId: d._id.toString(),
        title: d.title,
        courseCode: d.courseCode,
        courseTitle: d.courseTitle,
        dueDate: d.dueDate.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        interval: "3-day" as const,
      })),
    };

    const emailResult = await sendReminderDigestEmail(batch);
    if (!emailResult.success) {
      return NextResponse.json(
        { error: emailResult.error || "Failed to send digest email" },
        { status: 500 },
      );
    }

    let whatsappPhone: string | undefined;
    if (user.phone) {
      const whatsappResult = await sendWhatsAppBatchReminder(batch, user.phone);
      if (whatsappResult.success) {
        whatsappPhone = whatsappResult.maskedPhone;
      }
    }

    return NextResponse.json({
      success: true,
      sentTo: user.email,
      whatsappPhone,
      deadlineCount: batch.deadlines.length,
      deadlines: batch.deadlines.map((d) => d.title),
    });
  } catch (error) {
    console.error(
      "[test-notify]",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
