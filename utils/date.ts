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

/**
 * Calculate days difference between two dates in a specific timezone.
 * Properly handles timezone offsets (e.g., Asia/Karachi).
 * @example getDaysDifferenceInTimezone(pastDate, nowDate, "Asia/Karachi") returns number of calendar days
 */
export function getDaysDifferenceInTimezone(laterDate: Date, earlierDate: Date, timezone: string): number {
  const formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: timezone,
  });

  const formatDate = (date: Date): string => {
    const parts = formatter.formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    return `${year}-${month}-${day}`;
  };

  const dateStr1 = formatDate(laterDate);
  const dateStr2 = formatDate(earlierDate);

  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);

  return Math.floor((d1.getTime() - d2.getTime()) / DAY_IN_MS);
}
