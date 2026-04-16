import mongoose from "mongoose";
import { DeadlineModel, UserModel } from "@/lib/mongodb";
import { sendReminderEmail } from "@/lib/resend";
import { sendWhatsAppMessage } from "@/lib/whatsapp";
import { DeadlineNotificationPayload, ReminderInterval } from "@/types/notification";

const MS_PER_HOUR = 1000 * 60 * 60;

const INTERVAL_COOLDOWN_MS: Record<ReminderInterval, number> = {
  "3-day": 36 * MS_PER_HOUR,
  "1-day": 16 * MS_PER_HOUR,
  "day-of": 6 * MS_PER_HOUR,
};

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
    if (daysElapsed <= 7) {
      return true;
    }
  }

  return false;
}

export async function sendReminderNotifications(
  payload: DeadlineNotificationPayload,
  whatsappSentUsers: Set<string>,
): Promise<{ success: boolean; whatsappSent: boolean }> {
  let whatsappSent = false;

  // FIX 1C: Atomic claim — prevents duplicate sends across concurrent cron runs.
  // Writes to reminderSentDates only if no send has occurred within the cooldown window.
  // DO NOT REMOVE existing post-send reminderSentDates update below.
  const cooldownMs = INTERVAL_COOLDOWN_MS[payload.deadline.interval] ?? 6 * MS_PER_HOUR;
  const deadlineObjectId = new mongoose.Types.ObjectId(payload.deadlineId);
  const claimed = await DeadlineModel.findOneAndUpdate(
    {
      _id: deadlineObjectId,
      isCompleted: false,
      reminderSentDates: {
        $not: {
          $elemMatch: {
            $gte: new Date(Date.now() - cooldownMs),
          },
        },
      },
    },
    {
      $push: {
        reminderSentDates: {
          $each: [new Date()],
          $slice: -10,
        },
      },
    },
    { new: false },
  );

  if (claimed === null) {
    console.log("[notify/reminder-skipped-duplicate]", {
      deadlineId: payload.deadlineId,
      interval: payload.deadline.interval,
    });
    return { success: false, whatsappSent: false };
  }

  const emailResult = await sendReminderEmail(payload);
  if (!emailResult.success) {
    // Rollback the claim so next cron run can retry
    await DeadlineModel.updateOne(
      { _id: deadlineObjectId },
      { $pop: { reminderSentDates: 1 } },
    );
    console.error("[notify/email-failed]", {
      deadlineId: payload.deadlineId,
      userId: payload.userId,
      error: emailResult.error,
    });
    return { success: false, whatsappSent: false };
  }

  try {
    const user = await UserModel.findById(payload.userId)
      .select("phone isPro proExpiresAt trialStartedAt")
      .lean();

    if (!user?.phone) {
      console.log("[notify/whatsapp-skipped]", {
        reason: "No phone number on user",
        userId: payload.userId,
      });
    } else if (!isWhatsAppEligible(user)) {
      console.log("[notify/whatsapp-skipped]", {
        reason: "User not pro or trial expired",
        userId: payload.userId,
      });
    } else if (whatsappSentUsers.has(payload.userId)) {
      console.log("[notify/whatsapp-skipped]", {
        reason: "Already sent WhatsApp to this user in current cron run",
        userId: payload.userId,
      });
    } else {
      // DB-level dedup: atomic claim prevents duplicate WhatsApp across concurrent cron instances
      const startOfToday = new Date();
      startOfToday.setUTCHours(0, 0, 0, 0);
      const whatsappClaimed = await UserModel.findOneAndUpdate(
        {
          _id: payload.userId,
          $or: [
            { lastWhatsappSentAt: null },
            { lastWhatsappSentAt: { $lt: startOfToday } },
          ],
        },
        { $set: { lastWhatsappSentAt: new Date() } },
        { new: false },
      );
      if (!whatsappClaimed) {
        console.log("[notify/whatsapp-skipped]", {
          reason: "Already sent WhatsApp today (DB dedup)",
          userId: payload.userId,
        });
      } else {
        const whatsappResult = await sendWhatsAppMessage(payload, user.phone, false);
        whatsappSent = whatsappResult.success;
        if (!whatsappSent) {
          console.warn("[notify/whatsapp-failed]", {
            deadlineId: payload.deadlineId,
            error: whatsappResult.error,
            maskedPhone: whatsappResult.maskedPhone,
          });
        } else {
          whatsappSentUsers.add(payload.userId);
          await UserModel.updateOne(
            { _id: payload.userId },
            { $inc: { whatsappTrialUsed: 1 } }
          );
          console.log("[notify/whatsapp-success]", {
            deadlineId: payload.deadlineId,
            maskedPhone: whatsappResult.maskedPhone,
          });
        }
      }
    }
  } catch (whatsappError) {
    console.error(
      "[notify/whatsapp-send]",
      whatsappError instanceof Error ? whatsappError.message : String(whatsappError),
    );
  }

  return { success: true, whatsappSent };
}

export async function buildTestNotificationPayload(
  userId: string,
  userName: string,
  userEmail: string,
): Promise<DeadlineNotificationPayload | null> {
  const deadline = await DeadlineModel.findOne({
    userId,
    status: "upcoming",
    isCompleted: false,
    dueDate: { $gt: new Date() },
  })
    .sort({ dueDate: 1 })
    .lean();

  if (!deadline) return null;

  const otherDeadlines = await DeadlineModel.find({
    userId,
    status: "upcoming",
    isCompleted: false,
    dueDate: { $gt: new Date() },
    _id: { $ne: deadline._id },
  })
    .sort({ dueDate: 1 })
    .limit(4)
    .lean();

  const { getDeadlineUrgency } = await import("@/utils/date");

  return {
    deadlineId: deadline._id.toString(),
    userId,
    userEmail,
    userName,
    deadline: {
      title: deadline.title,
      courseCode: deadline.courseCode,
      courseTitle: deadline.courseTitle,
      dueDate: deadline.dueDate.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      interval: "3-day",
      allUpcoming: otherDeadlines.map((d) => ({
        title: d.title,
        courseCode: d.courseCode,
        dueDate: d.dueDate.toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
        urgency: getDeadlineUrgency(d.dueDate) as
          | "today"
          | "tomorrow"
          | "3-day"
          | "upcoming",
      })),
    },
  };
}

// NOTE: Overdue WhatsApp gating must also be applied in app/api/cron/notify/route.ts
// where overdue WhatsApp messages are sent directly.
