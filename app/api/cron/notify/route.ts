import { NextResponse } from "next/server";
import {
  getDeadlinesNeedingReminder,
  getDeadlinesNeedingOverdueNotice,
} from "@/lib/notifications";
import { sendOverdueEmail } from "@/lib/resend";
import { DeadlineModel, UserModel, connectToDatabase } from "@/lib/mongodb";
import { sendReminderNotifications } from "@/lib/notifications-send";
import { sendWhatsAppOverdueMessage } from "@/lib/whatsapp";

export async function GET(request: Request): Promise<NextResponse> {
  try {
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
    let whatsappSent = 0;
    let whatsappOverdueSent = 0;
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

          try {
            const user = await UserModel.findById(payload.userId).lean();
            if (user?.phone) {
              const whatsappResult = await sendWhatsAppOverdueMessage(payload, user.phone);
              if (whatsappResult.success) {
                whatsappOverdueSent++;
                console.log("[cron/notify/whatsapp-overdue-success]", {
                  deadlineId: payload.deadlineId,
                  maskedPhone: whatsappResult.maskedPhone,
                });
              } else {
                console.warn("[cron/notify/whatsapp-overdue-failed]", {
                  deadlineId: payload.deadlineId,
                  error: whatsappResult.error,
                  maskedPhone: whatsappResult.maskedPhone,
                });
              }
            } else {
              console.log("[cron/notify/whatsapp-overdue-skipped]", {
                reason: "No phone number on user",
                userId: payload.userId,
              });
            }
          } catch (whatsappError) {
            console.error(
              "[cron/notify/whatsapp-overdue-send]",
              whatsappError instanceof Error
                ? whatsappError.message
                : String(whatsappError),
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
      whatsappOverdueSent,
      errors,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      sent: remindersSent,
      whatsappSent,
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
