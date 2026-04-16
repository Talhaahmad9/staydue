import { connectToDatabase, DeadlineModel, UserModel } from "@/lib/mongodb";
import { DeadlineNotificationPayload, ReminderInterval } from "@/types/notification";
import { getDeadlineUrgency, getDaysDifferenceInTimezone } from "@/utils/date";

// This function is the single source of truth for notification scheduling.
// Email delivery calls this directly. WhatsApp delivery will call the same
// function and use the same payload — only the delivery function changes.
// To add WhatsApp: import sendWhatsAppReminder from lib/whatsapp.ts
// and call it alongside sendReminderEmail in the cron handler.

export async function getDeadlinesNeedingReminder(): Promise<DeadlineNotificationPayload[]> {
  try {
    await connectToDatabase();

    const now = new Date();

    // Single query: all qualifying deadlines across all users
    const allDeadlines = await DeadlineModel.find({
      status: "upcoming",
      isCompleted: false,
      dueDate: { $gt: now },
    })
      .sort({ dueDate: 1 })
      .lean();

    if (allDeadlines.length === 0) return [];

    // Batch fetch eligible users (2 queries total instead of N+1)
    const userIds = [...new Set(allDeadlines.map((d) => d.userId.toString()))];
    const users = await UserModel.find({
      _id: { $in: userIds },
      hasCompletedOnboarding: true,
      email: { $exists: true, $ne: null },
    }).lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    // Group deadlines by user
    const deadlinesByUser = new Map<string, typeof allDeadlines>();
    for (const deadline of allDeadlines) {
      const uid = deadline.userId.toString();
      if (!userMap.has(uid)) continue;
      if (!deadlinesByUser.has(uid)) deadlinesByUser.set(uid, []);
      deadlinesByUser.get(uid)!.push(deadline);
    }

    const payloads: DeadlineNotificationPayload[] = [];

    for (const [uid, deadlines] of deadlinesByUser) {
      const user = userMap.get(uid)!;
      if (!user.email) continue;
      if (user.notificationPreferences?.emailEnabled === false) continue;

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
            userId: uid,
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
    throw error;
  }
}

export async function getDeadlinesNeedingOverdueNotice(): Promise<DeadlineNotificationPayload[]> {
  try {
    await connectToDatabase();

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Single query: all qualifying overdue deadlines across all users
    const allOverdue = await DeadlineModel.find({
      status: "overdue",
      isCompleted: false,
      dueDate: { $gte: thirtyDaysAgo, $lt: now },
      overdueNotificationCount: { $lt: 3 },
    }).lean();

    if (allOverdue.length === 0) return [];

    // Batch fetch eligible users (2 queries total instead of N+1)
    const userIds = [...new Set(allOverdue.map((d) => d.userId.toString()))];
    const users = await UserModel.find({
      _id: { $in: userIds },
      hasCompletedOnboarding: true,
      email: { $exists: true, $ne: null },
    }).lean();

    const userMap = new Map(users.map((u) => [u._id.toString(), u]));

    const payloads: DeadlineNotificationPayload[] = [];

    for (const deadline of allOverdue) {
      const uid = deadline.userId.toString();
      const user = userMap.get(uid);
      if (!user || !user.email) continue;

      let shouldSend = false;
      const userTimezone = user.timezone || "Asia/Karachi";
      const daysSinceDue = getDaysDifferenceInTimezone(now, deadline.dueDate, userTimezone);

      const count = deadline.overdueNotificationCount || 0;

      if (count === 0) {
        shouldSend = daysSinceDue >= 1 && daysSinceDue <= 2;
      } else if (count === 1) {
        const daysSinceNotified = deadline.overdueNotifiedAt
          ? getDaysDifferenceInTimezone(now, deadline.overdueNotifiedAt, userTimezone)
          : 0;
        shouldSend = daysSinceNotified >= 3;
      } else if (count === 2) {
        const daysSinceNotified = deadline.overdueNotifiedAt
          ? getDaysDifferenceInTimezone(now, deadline.overdueNotifiedAt, userTimezone)
          : 0;
        shouldSend = daysSinceNotified >= 7;
      }

      if (shouldSend) {
        payloads.push({
          deadlineId: deadline._id.toString(),
          userId: uid,
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
            interval: "day-of",
            allUpcoming: [],
          },
        });
      }
    }

    return payloads;
  } catch (error) {
    console.error("[notifications/get-overdue]", error instanceof Error ? error.message : String(error));
    throw error;
  }
}

function wasRecentlySent(sentDates: Date[], cooldownMs: number): boolean {
  const now = Date.now();
  return sentDates.some((d) => now - d.getTime() < cooldownMs);
}

function getIntervalsForDeadline(dueDate: Date, reminderSentDates: Date[]): ReminderInterval[] {
  const now = new Date();
  const intervals: ReminderInterval[] = [];

  const msPerHour = 1000 * 60 * 60;
  const msDue = dueDate.getTime();
  const msNow = now.getTime();
  const hoursUntilDue = (msDue - msNow) / msPerHour;

  const threeDayCooldownMs = 36 * msPerHour;
  const oneDayCooldownMs = 16 * msPerHour;
  const dayOfCooldownMs = 6 * msPerHour;

  // 3-day interval: between 48hrs and 84hrs from now
  if (hoursUntilDue >= 48 && hoursUntilDue < 84) {
    if (!wasRecentlySent(reminderSentDates, threeDayCooldownMs)) {
      intervals.push("3-day");
    }
  }

  // 1-day interval: between 8hrs and 48hrs from now
  if (hoursUntilDue >= 8 && hoursUntilDue < 48) {
    if (!wasRecentlySent(reminderSentDates, oneDayCooldownMs)) {
      intervals.push("1-day");
    }
  }

  // day-of interval: between 0.5hrs and 8hrs from now
  if (hoursUntilDue >= 0.5 && hoursUntilDue < 8) {
    if (!wasRecentlySent(reminderSentDates, dayOfCooldownMs)) {
      intervals.push("day-of");
    }
  }

  return intervals;
}
