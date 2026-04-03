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
