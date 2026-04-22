import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import mongoose from "mongoose";

import { connectToDatabase, UserModel, DeadlineModel } from "@/lib/mongodb";
import { authOptions } from "@/lib/auth";
import { sendOverdueDigestEmail } from "@/lib/resend";
import { sendWhatsAppOverdueMessage } from "@/lib/whatsapp";
import { getDaysDifferenceInTimezone } from "@/utils/date";
import { BatchNotificationPayload, BatchDeadlineItem } from "@/types/notification";

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

    const userTimezone = user.timezone || "Asia/Karachi";
    const qualifyingDeadlines: Array<{ item: BatchDeadlineItem; reason: string; daysSinceDue: number; notificationCount: number }> = [];
    const skippedResults: Array<{ title: string; sent: false; skipped: true; reason: string; daysSinceDue: number; notificationCount: number }> = [];

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
        qualifyingDeadlines.push({
          item: {
            deadlineId: deadline._id.toString(),
            title: deadline.title,
            courseCode: deadline.courseCode,
            courseTitle: deadline.courseTitle,
            dueDate: deadline.dueDate.toLocaleDateString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
            }),
            interval: "day-of" as const,
          },
          reason,
          daysSinceDue,
          notificationCount: count,
        });
      } else {
        skippedResults.push({
          title: deadline.title,
          sent: false,
          skipped: true,
          reason,
          daysSinceDue,
          notificationCount: count,
        });
      }
    }

    if (qualifyingDeadlines.length === 0) {
      return NextResponse.json({
        success: false,
        message: "No overdue deadlines qualify for notification right now",
        skipped: skippedResults,
      });
    }

    // Build batch payload and send ONE digest email + ONE WhatsApp
    const batch: BatchNotificationPayload = {
      userId: user._id.toString(),
      userEmail: user.email,
      userName: user.name || "Student",
      deadlines: qualifyingDeadlines.map((q) => q.item),
    };

    const emailResult = await sendOverdueDigestEmail(batch);

    const results: Array<Record<string, unknown>> = [];

    if (emailResult.success) {
      results.push({
        channel: "email",
        sent: true,
        deadlineCount: batch.deadlines.length,
        deadlines: batch.deadlines.map((d) => d.title),
      });
    } else {
      results.push({
        channel: "email",
        sent: false,
        error: emailResult.error,
      });
    }

    if (user.phone) {
      let whatsappSentCount = 0;
      const whatsappErrors: string[] = [];
      for (const dl of batch.deadlines) {
        const whatsappResult = await sendWhatsAppOverdueMessage(
          {
            deadlineTitle: dl.title,
            courseTitle: dl.courseTitle,
            courseCode: dl.courseCode,
            dueDate: dl.dueDate,
          },
          user.phone,
        );
        if (whatsappResult.success) {
          whatsappSentCount++;
        } else if (whatsappResult.error) {
          whatsappErrors.push(whatsappResult.error);
        }
      }
      results.push({
        channel: "whatsapp",
        sent: whatsappSentCount > 0,
        sentCount: whatsappSentCount,
        deadlineCount: batch.deadlines.length,
        ...(whatsappErrors.length > 0 && { errors: whatsappErrors }),
      });
    } else {
      results.push({
        channel: "whatsapp",
        sent: false,
        skipped: true,
        reason: "No phone number",
      });
    }

    return NextResponse.json({
      success: true,
      testResults: results,
      qualifying: qualifyingDeadlines.map((q) => ({
        title: q.item.title,
        reason: q.reason,
        daysSinceDue: q.daysSinceDue,
        notificationCount: q.notificationCount,
      })),
      skipped: skippedResults,
      userTimezone,
      debugInfo: {
        now: now.toISOString(),
        totalOverdueDeadlines: overdueDeadlines.length,
        qualifyingCount: qualifyingDeadlines.length,
      },
    });
  } catch (error) {
    console.error("[test-overdue]", error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
