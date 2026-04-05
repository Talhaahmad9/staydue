import { connectToDatabase, DeadlineModel, UserModel } from "@/lib/mongodb";
import { DeadlineNotificationPayload, ReminderInterval } from "@/types/notification";
import { getDeadlineUrgency } from "@/utils/date";

// This function is the single source of truth for notification scheduling.
// Email delivery calls this directly. WhatsApp delivery will call the same
// function and use the same payload — only the delivery function changes.
// To add WhatsApp: import sendWhatsAppReminder from lib/whatsapp.ts
// and call it alongside sendReminderEmail in the cron handler.

export async function getDeadlinesNeedingReminder(): Promise<DeadlineNotificationPayload[]> {
  try {
    await connectToDatabase();

    const now = new Date();
    const payloads: DeadlineNotificationPayload[] = [];

    // Get all users who have completed onboarding and have email
    const users = await UserModel.find({
      hasCompletedOnboarding: true,
      email: { $exists: true, $ne: null },
    }).lean();

    for (const user of users) {
      if (!user.email) continue;

      // Skip if email notifications are disabled
      if (user.notificationPreferences?.emailEnabled === false) {
        continue;
      }

      // Get all upcoming deadlines for this user
      const deadlines = await DeadlineModel.find({
        userId: user._id,
        status: "upcoming",
        isCompleted: false,
        dueDate: { $gt: now },
      })
        .sort({ dueDate: 1 })
        .lean();

      for (const deadline of deadlines) {
        const intervals = getIntervalsForDeadline(deadline.dueDate, deadline.reminderSentDates || []);

        // Filter intervals based on user preferences
        const enabledIntervals = intervals.filter((interval) => {
          const mappedInterval = interval === "day-of" ? "day-of" : interval;
          return user.notificationPreferences?.reminderIntervals?.includes(mappedInterval) ?? true;
        });

        for (const interval of enabledIntervals) {
          // Get up to 4 other upcoming deadlines for context
          const otherDeadlines = deadlines.filter((d) => d._id.toString() !== deadline._id.toString()).slice(0, 4);

          const payload: DeadlineNotificationPayload = {
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
              interval,
              allUpcoming: otherDeadlines.map((d) => ({
                title: d.title,
                courseCode: d.courseCode,
                dueDate: d.dueDate.toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
                urgency: (getDeadlineUrgency(d.dueDate) as "today" | "tomorrow" | "3-day" | "upcoming"),
              })),
            },
          };

          payloads.push(payload);
        }
      }
    }

    return payloads;
  } catch (error) {
    console.error("[notifications/get-reminders]", error instanceof Error ? error.message : String(error));
    return [];
  }
}

export async function getDeadlinesNeedingOverdueNotice(): Promise<DeadlineNotificationPayload[]> {
  try {
    await connectToDatabase();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const payloads: DeadlineNotificationPayload[] = [];

    // Get all users
    const users = await UserModel.find({
      hasCompletedOnboarding: true,
      email: { $exists: true, $ne: null },
    }).lean();

    for (const user of users) {
      if (!user.email) continue;

      // Get overdue deadlines within 30 days
      const overdueDeadlines = await DeadlineModel.find({
        userId: user._id,
        status: "overdue",
        isCompleted: false,
        dueDate: { $gte: thirtyDaysAgo, $lt: now },
        overdueNotificationCount: { $lt: 3 },
      }).lean();

      for (const deadline of overdueDeadlines) {
        let shouldSend = false;
        const daysSinceDue = Math.floor((now.getTime() - deadline.dueDate.getTime()) / (1000 * 60 * 60 * 24));

        const count = deadline.overdueNotificationCount || 0;

        if (count === 0) {
          // First notification: send if 1-2 days overdue
          shouldSend = daysSinceDue >= 1 && daysSinceDue <= 2;
        } else if (count === 1) {
          // Second notification: send if 3+ days since the last notification
          const daysSinceNotified = deadline.overdueNotifiedAt
            ? Math.floor((now.getTime() - deadline.overdueNotifiedAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          shouldSend = daysSinceNotified >= 3;
        } else if (count === 2) {
          // Third notification: send if 7+ days since the last notification
          const daysSinceNotified = deadline.overdueNotifiedAt
            ? Math.floor((now.getTime() - deadline.overdueNotifiedAt.getTime()) / (1000 * 60 * 60 * 24))
            : 0;
          shouldSend = daysSinceNotified >= 7;
        }

        if (shouldSend) {
          const payload: DeadlineNotificationPayload = {
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
              interval: "day-of", // Use day-of styling for overdue
              allUpcoming: [], // No upcoming deadlines for overdue notices
            },
          };

          payloads.push(payload);
        }
      }
    }

    return payloads;
  } catch (error) {
    console.error("[notifications/get-overdue]", error instanceof Error ? error.message : String(error));
    return [];
  }
}

function getIntervalsForDeadline(dueDate: Date, reminderSentDates: Date[]): ReminderInterval[] {
  const now = new Date();
  const intervals: ReminderInterval[] = [];

  const msPerHour = 1000 * 60 * 60;
  const msDue = dueDate.getTime();
  const msNow = now.getTime();
  const hoursUntilDue = (msDue - msNow) / msPerHour;

  // 3-day interval: between 72hrs and 60hrs from now
  if (hoursUntilDue >= 60 && hoursUntilDue <= 72) {
    const lastSent = reminderSentDates[reminderSentDates.length - 1];
    if (!lastSent || msNow - lastSent.getTime() > 60 * msPerHour) {
      intervals.push("3-day");
    }
  }

  // 1-day interval: between 28hrs and 20hrs from now
  if (hoursUntilDue >= 20 && hoursUntilDue <= 28) {
    const lastSent = reminderSentDates[reminderSentDates.length - 1];
    if (!lastSent || msNow - lastSent.getTime() > 20 * msPerHour) {
      intervals.push("1-day");
    }
  }

  // day-of interval: between 8hrs and 1hr from now
  if (hoursUntilDue >= 1 && hoursUntilDue <= 8) {
    const lastSent = reminderSentDates[reminderSentDates.length - 1];
    if (!lastSent || msNow - lastSent.getTime() > 8 * msPerHour) {
      intervals.push("day-of");
    }
  }

  return intervals;
}
