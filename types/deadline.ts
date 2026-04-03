export type DeadlineUrgency = "today" | "tomorrow" | "upcoming";

export interface Deadline {
  id: string;
  userId: string;
  title: string;
  course: string;
  courseCode: string;
  courseTitle: string;
  catalogYear: string;
  description?: string;
  dueDate: Date;
  sourceEventId: string;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ParsedDeadline {
  title: string;
  course: string;
  courseCode: string;
  description?: string;
  dueDate: Date;
  sourceEventId: string;
}
