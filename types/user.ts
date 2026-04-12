export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  moodleCalendarUrl?: string;
  admissionYear?: string;
  timezone: string;
  hasCompletedOnboarding: boolean;
  isPro: boolean;
  proExpiresAt: Date | null;
  trialStartedAt: Date | null;
  trialPhoneNumber: string | null;
  whatsappTrialUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
}
