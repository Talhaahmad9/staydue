import { NextResponse } from "next/server";
import {
  getDeadlinesNeedingReminder,
  getDeadlinesNeedingOverdueNotice,
} from "@/lib/notifications";
import { sendOverdueEmail } from "@/lib/resend";
import { DeadlineModel, connectToDatabase } from "@/lib/mongodb";
import { sendReminderNotifications } from "@/lib/notifications-send";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Verify authorization
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    let remindersSent = 0;
    let overduesSent = 0;
    let whatsappSent = 0;
    let errors = 0;

    // Send reminder emails + whatsapp
    try {
      const remindersPayloads = await getDeadlinesNeedingReminder();
      for (const payload of remindersPayloads) {
        const result = await sendReminderNotifications(payload);
        if (result.success) {
          remindersSent++;
          if (result.whatsappSent) whatsappSent++;
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

    // Send overdue emails
    try {
      const overduePayloads = await getDeadlinesNeedingOverdueNotice();
      for (const payload of overduePayloads) {
        const result = await sendOverdueEmail(payload);
        if (result.success) {
          try {
            await DeadlineModel.updateOne(
              { _id: payload.deadlineId },
              {
                $set: { overdueNotifiedAt: new Date() },
                $inc: { overdueNotificationCount: 1 },
              },
            );
            overduesSent++;
          } catch (updateError) {
            console.error(
              "[cron/notify/update-overdue]",
              updateError instanceof Error
                ? updateError.message
                : String(updateError),
            );
          }
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
      whatsappSent,
      overduesSent,
      errors,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      sent: remindersSent,
      whatsappSent,
      overdueSent: overduesSent,
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
