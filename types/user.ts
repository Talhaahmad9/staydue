export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  moodleCalendarUrl?: string;
  admissionYear?: string;
  timezone: string;
  hasCompletedOnboarding: boolean;
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
