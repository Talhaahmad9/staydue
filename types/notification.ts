export type NotificationChannel = "email" | "whatsapp";

export interface NotificationPreferences {
  userId: string;
  channels: NotificationChannel[];
  daysBefore: number[];
  quietHoursStart: number;
  quietHoursEnd: number;
}

export type NotificationStatus = "queued" | "sent" | "delivered" | "failed";

export interface NotificationLog {
  id: string;
  userId: string;
  deadlineId: string;
  channel: NotificationChannel;
  status: NotificationStatus;
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type ReminderInterval = "3-day" | "1-day" | "day-of";

export interface UpcomingDeadlineSummary {
  title: string;
  courseCode: string;
  dueDate: string;
  urgency: "today" | "tomorrow" | "3-day" | "upcoming";
}

export interface DeadlineNotificationPayload {
  deadlineId: string;
  userId: string;
  userEmail: string;
  userName: string;
  deadline: {
    title: string;
    courseCode: string;
    courseTitle: string;
    dueDate: string;
    interval: ReminderInterval;
    allUpcoming: UpcomingDeadlineSummary[];
  };
}

export interface BatchDeadlineItem {
  deadlineId: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: string;
  interval: ReminderInterval;
}

export interface BatchNotificationPayload {
  userId: string;
  userEmail: string;
  userName: string;
  deadlines: BatchDeadlineItem[];
}
