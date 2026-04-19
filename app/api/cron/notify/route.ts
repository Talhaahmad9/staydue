import { NextResponse } from "next/server";
import {
  getDeadlinesNeedingReminder,
  getDeadlinesNeedingOverdueNotice,
  groupPayloadsByUser,
} from "@/lib/notifications";
import { DeadlineModel, connectToDatabase } from "@/lib/mongodb";
import {
  sendBatchReminderNotifications,
  sendBatchOverdueNotifications,
} from "@/lib/notifications-send";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // FIX 1A: Reject early if CRON_SECRET is not configured
    if (!process.env.CRON_SECRET) {
      console.error('[cron] CRON_SECRET env var is not set');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    // Update all upcoming deadlines that have passed to overdue status
    try {
      const now = new Date();
      const result = await DeadlineModel.updateMany(
        {
          isCompleted: false,
          status: "upcoming",
          dueDate: { $lt: now },
        },
        { status: "overdue" }
      );
      if (result.modifiedCount > 0) {
        console.log("[cron/notify/status-update]", {
          updated: result.modifiedCount,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (statusError) {
      console.error(
        "[cron/notify/status-update-error]",
        statusError instanceof Error ? statusError.message : String(statusError),
      );
    }

    let remindersSent = 0;
    let overduesSent = 0;
    let whatsappReminderSent = 0;
    let whatsappOverdueSent = 0;
    let errors = 0;

    // Send batch reminder emails + WhatsApp (one per user)
    try {
      const remindersPayloads = await getDeadlinesNeedingReminder();
      const batches = groupPayloadsByUser(remindersPayloads);

      for (const batch of batches) {
        const result = await sendBatchReminderNotifications(batch);
        if (result.emailSent) {
          remindersSent += result.claimedCount;
          if (result.whatsappSent) whatsappReminderSent++;
        } else if (result.claimedCount === 0) {
          // All deadlines were already claimed — not an error
        } else {
          errors++;
        }
      }
    } catch (reminderError) {
      console.error(
        "[cron/notify/reminders]",
        reminderError instanceof Error
          ? reminderError.message
          : String(reminderError),
      );
    }

    // Send batch overdue emails + WhatsApp (one per user)
    try {
      const overduePayloads = await getDeadlinesNeedingOverdueNotice();
      const batches = groupPayloadsByUser(overduePayloads);

      for (const batch of batches) {
        const result = await sendBatchOverdueNotifications(batch);
        if (result.emailSent) {
          overduesSent += result.claimedCount;
          if (result.whatsappSent) whatsappOverdueSent++;
        } else if (result.claimedCount === 0) {
          // All deadlines were already claimed — not an error
        } else {
          errors++;
        }
      }
    } catch (overdueError) {
      console.error(
        "[cron/notify/overdue]",
        overdueError instanceof Error
          ? overdueError.message
          : String(overdueError),
      );
    }

    console.log("[cron/notify/summary]", {
      remindersSent,
      whatsappReminderSent,
      overduesSent,
      whatsappOverdueSent,
      errors,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      sent: remindersSent,
      whatsappSent: whatsappReminderSent,
      overdueSent: overduesSent,
      whatsappOverdueSent,
      errors,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "[cron/notify]",
      error instanceof Error ? error.message : String(error),
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
