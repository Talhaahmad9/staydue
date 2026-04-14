import { NextResponse } from "next/server";
import {
  getDeadlinesNeedingReminder,
  getDeadlinesNeedingOverdueNotice,
} from "@/lib/notifications";
import { sendOverdueEmail } from "@/lib/resend";
import { DeadlineModel, UserModel, connectToDatabase } from "@/lib/mongodb";
import { sendReminderNotifications } from "@/lib/notifications-send";
import { sendWhatsAppOverdueMessage } from "@/lib/whatsapp";

function isWhatsAppEligible(user: {
  isPro: boolean;
  proExpiresAt: Date | null;
  trialStartedAt: Date | null;
}): boolean {
  const now = new Date();
  if (user.isPro && user.proExpiresAt && user.proExpiresAt > now) {
    return true;
  }
  if (user.trialStartedAt) {
    const msElapsed = now.getTime() - user.trialStartedAt.getTime();
    const daysElapsed = msElapsed / (1000 * 60 * 60 * 24);
    if (daysElapsed <= 7) return true;
  }
  return false;
}

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

    // FIX 1B: Per-user WhatsApp deduplication across both reminder and overdue loops
    const whatsappSentUsers = new Set<string>();

    let remindersSent = 0;
    let overduesSent = 0;
    let whatsappSent = 0;
    let whatsappOverdueSent = 0;
    let errors = 0;

    // Send reminder emails + whatsapp
    try {
      const remindersPayloads = await getDeadlinesNeedingReminder();
      for (const payload of remindersPayloads) {
        const result = await sendReminderNotifications(payload, whatsappSentUsers);
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
        // FIX 1D: Atomic claim — prevents duplicate overdue sends across concurrent cron runs.
        // DO NOT REMOVE existing post-send overdueNotificationCount update below.
        const claimedOverdue = await DeadlineModel.findOneAndUpdate(
          {
            _id: payload.deadlineId,
            overdueNotificationCount: { $lt: 3 },
          },
          {
            $inc: { overdueNotificationCount: 1 },
            $set: { overdueNotifiedAt: new Date() },
          },
          { new: false },
        );

        if (claimedOverdue === null) {
          console.log("[cron/notify/overdue-skipped-duplicate]", {
            deadlineId: payload.deadlineId,
          });
          continue;
        }

        const result = await sendOverdueEmail(payload);
        if (result.success) {
          if (claimedOverdue !== null) {
            overduesSent++;
          }

          try {
            const user = await UserModel.findById(payload.userId)
              .select("phone isPro proExpiresAt trialStartedAt")
              .lean();
            if (!user?.phone) {
              console.log("[cron/notify/whatsapp-overdue-skipped]", {
                reason: "No phone number on user",
                userId: payload.userId,
              });
            } else if (!isWhatsAppEligible(user)) {
              console.log("[cron/notify/whatsapp-overdue-skipped]", {
                reason: "User not pro or trial expired",
                userId: payload.userId,
              });
            } else if (whatsappSentUsers.has(payload.userId)) {
              // FIX 1B: Per-user WhatsApp deduplication within a single cron run
              console.log("[cron/notify/whatsapp-overdue-skipped]", {
                reason: "Already sent WhatsApp to this user in current cron run",
                userId: payload.userId,
              });
            } else {
              const whatsappResult = await sendWhatsAppOverdueMessage(payload, user.phone);
              if (whatsappResult.success) {
                whatsappOverdueSent++;
                whatsappSentUsers.add(payload.userId);
                await UserModel.updateOne(
                  { _id: payload.userId },
                  { $inc: { whatsappTrialUsed: 1 } }
                );
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
            }
          } catch (whatsappError) {
            console.error(
              "[cron/notify/whatsapp-overdue-send]",
              whatsappError instanceof Error ? whatsappError.message : String(whatsappError),
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
