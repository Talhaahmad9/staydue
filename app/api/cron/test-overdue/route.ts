import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { connectToDatabase, UserModel, DeadlineModel } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { sendOverdueEmail } from "@/lib/resend";
import { sendWhatsAppOverdueMessage } from "@/lib/whatsapp";
import { getDaysDifferenceInTimezone } from "@/utils/date";

export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.user.id).lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userObjectId = new mongoose.Types.ObjectId(session.user.id);
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Check ALL deadlines first (for debugging)
    const allDeadlines = await DeadlineModel.find({ userId: userObjectId }).lean();

    // Get overdue deadlines
    const overdueDeadlines = await DeadlineModel.find({
      userId: userObjectId,
      status: "overdue",
      isCompleted: false,
      dueDate: { $gte: thirtyDaysAgo, $lt: now },
      overdueNotificationCount: { $lt: 3 },
    }).lean();

    if (overdueDeadlines.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No overdue deadlines found that need notification",
        debugInfo: {
          totalDeadlines: allDeadlines.length,
          upcomingCount: allDeadlines.filter((d) => d.status === "upcoming").length,
          overdueCount: allDeadlines.filter((d) => d.status === "overdue").length,
          doneCount: allDeadlines.filter((d) => d.status === "done").length,
          allDeadlines: allDeadlines.map((d) => ({
            title: d.title,
            status: d.status,
            dueDate: d.dueDate.toISOString(),
            overdueNotificationCount: d.overdueNotificationCount,
            isCompleted: d.isCompleted,
          })),
        },
      });
    }

    // Test sending overdue emails for all qualifying deadlines
    const results = [];
    const userTimezone = user.timezone || "Asia/Karachi";

    for (const deadline of overdueDeadlines) {
      const daysSinceDue = getDaysDifferenceInTimezone(now, deadline.dueDate, userTimezone);
      const count = deadline.overdueNotificationCount || 0;

      let shouldSend = false;
      let reason = "";

      if (count === 0) {
        shouldSend = daysSinceDue >= 1 && daysSinceDue <= 2;
        reason = `First email: ${daysSinceDue} days overdue (needs 1-2 days)`;
      } else if (count === 1) {
        const daysSinceNotified = deadline.overdueNotifiedAt
          ? getDaysDifferenceInTimezone(now, deadline.overdueNotifiedAt, userTimezone)
          : 0;
        shouldSend = daysSinceNotified >= 3;
        reason = `Second email: ${daysSinceNotified} days since last notification (needs 3+ days)`;
      } else if (count === 2) {
        const daysSinceNotified = deadline.overdueNotifiedAt
          ? getDaysDifferenceInTimezone(now, deadline.overdueNotifiedAt, userTimezone)
          : 0;
        shouldSend = daysSinceNotified >= 7;
        reason = `Third email: ${daysSinceNotified} days since last notification (needs 7+ days)`;
      }

      if (shouldSend) {
        const payload = {
          deadlineId: deadline._id.toString(),
          userId: user._id.toString(),
          userEmail: user.email,
          userName: user.name || "Student",
          deadline: {
            title: deadline.title,
            courseCode: deadline.courseCode,
            courseTitle: deadline.courseTitle,
            dueDate: deadline.dueDate.toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            interval: "day-of" as const,
            allUpcoming: [],
          },
        };

        const emailResult = await sendOverdueEmail(payload);
        results.push({
          title: deadline.title,
          channel: "email",
          sent: emailResult.success,
          error: emailResult.error,
          reason,
          daysSinceDue,
          notificationCount: count,
        });

        if (user.phone) {
          const whatsappResult = await sendWhatsAppOverdueMessage(payload, user.phone);
          results.push({
            title: deadline.title,
            channel: "whatsapp",
            sent: whatsappResult.success,
            ...(whatsappResult.error && { error: whatsappResult.error }),
            ...(whatsappResult.maskedPhone && { maskedPhone: whatsappResult.maskedPhone }),
          });
        } else {
          results.push({
            title: deadline.title,
            channel: "whatsapp",
            sent: false,
            skipped: true,
            reason: "No phone number",
          });
        }
      } else {
        results.push({
          title: deadline.title,
          sent: false,
          skipped: true,
          reason,
          daysSinceDue,
          notificationCount: count,
        });
      }
    }

    return NextResponse.json({
      success: true,
      testResults: results,
      userTimezone,
      debugInfo: {
        now: now.toISOString(),
        totalOverdueDeadlines: overdueDeadlines.length,
        emailsSent: results.filter((r) => r.sent).length,
      },
    });
  } catch (error) {
    console.error("[test-overdue]", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
