import mongoose, { Model, Schema } from "mongoose";

interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  moodleCalendarUrl?: string;
  admissionYear?: string;
  timezone: string;
  hasCompletedOnboarding: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface DeadlineDocument {
  userId: mongoose.Types.ObjectId;
  title: string;
  course: string;
  courseCode: string;
  courseTitle: string;
  catalogYear: string;
  description?: string;
  dueDate: Date;
  sourceEventId: string;
  // isCompleted: self-reported by user via dashboard, email link, or WhatsApp reply
  // Never overwritten by calendar resync
  // Used to suppress all reminders (email + WhatsApp) when true
  isCompleted: boolean;
  status: "upcoming" | "done" | "overdue";
  doneAt?: Date;
  overdueNotifiedAt?: Date;
  overdueNotificationCount: number;
  reminderSentDates: Date[];
  createdAt: Date;
  updatedAt: Date;
}

interface CourseCatalogEntry {
  code: string;
  title: string;
}

interface CourseCatalogDocument {
  catalogYear: string;
  courses: CourseCatalogEntry[];
  version?: string;
  generatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: false, default: "" },
    phone: { type: String, required: false },
    moodleCalendarUrl: { type: String, required: false },
    admissionYear: { type: String, required: false, trim: true },
    timezone: { type: String, required: true, default: "Asia/Karachi" },
    hasCompletedOnboarding: { type: Boolean, required: true, default: false },
  },
  { timestamps: true }
);

const deadlineSchema = new Schema<DeadlineDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    courseCode: { type: String, required: true, trim: true },
    courseTitle: { type: String, required: true, trim: true },
    catalogYear: { type: String, required: true, trim: true },
    description: { type: String, required: false },
    dueDate: { type: Date, required: true, index: true },
    sourceEventId: { type: String, required: true },
    isCompleted: { type: Boolean, required: true, default: false },
    status: { type: String, enum: ["upcoming", "done", "overdue"], required: true, default: "upcoming", index: true },
    doneAt: { type: Date, required: false },
    overdueNotifiedAt: { type: Date, required: false },
    overdueNotificationCount: { type: Number, required: true, default: 0 },
    reminderSentDates: { type: [Date], required: true, default: [] },
  },
  { timestamps: true }
);

const courseCatalogSchema = new Schema<CourseCatalogDocument>(
  {
    catalogYear: { type: String, required: true, unique: true, trim: true },
    courses: [
      {
        code: { type: String, required: true, trim: true },
        title: { type: String, required: true, trim: true },
      },
    ],
    version: { type: String, required: false, trim: true },
    generatedAt: { type: Date, required: false },
  },
  { timestamps: true }
);

deadlineSchema.index({ userId: 1, sourceEventId: 1 }, { unique: true });
deadlineSchema.index({ userId: 1, courseCode: 1 });

const globalWithMongoose = globalThis as typeof globalThis & {
  mongooseConnection?: Promise<typeof mongoose>;
};

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }

  if (!globalWithMongoose.mongooseConnection) {
    globalWithMongoose.mongooseConnection = mongoose.connect(process.env.MONGODB_URI);
  }

  return globalWithMongoose.mongooseConnection;
}

export const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);

export const DeadlineModel: Model<DeadlineDocument> =
  mongoose.models.Deadline || mongoose.model<DeadlineDocument>("Deadline", deadlineSchema);

export const CourseCatalogModel: Model<CourseCatalogDocument> =
  mongoose.models.CourseCatalog ||
  mongoose.model<CourseCatalogDocument>("CourseCatalog", courseCatalogSchema);

export type { UserDocument, DeadlineDocument, CourseCatalogDocument, CourseCatalogEntry };
