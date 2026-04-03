import type { DeadlineUrgency } from "@/types/deadline";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DASHBOARD_DATE_LOCALE = "en-GB";
const DASHBOARD_TIME_ZONE = "Asia/Karachi";

const dueDateFormatter = new Intl.DateTimeFormat(DASHBOARD_DATE_LOCALE, {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
  timeZone: DASHBOARD_TIME_ZONE,
});

function stripTime(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getDeadlineUrgency(dueDate: Date, now = new Date()): DeadlineUrgency {
  const due = stripTime(dueDate).getTime();
  const current = stripTime(now).getTime();
  const deltaDays = Math.floor((due - current) / DAY_IN_MS);

  if (deltaDays <= 0) {
    return "today";
  }

  if (deltaDays === 1) {
    return "tomorrow";
  }

  return "upcoming";
}

export function formatDashboardDueDate(dueDate: Date): string {
  return dueDateFormatter.format(dueDate);
}
