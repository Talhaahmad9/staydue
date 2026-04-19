import mongoose, { Model, Schema } from "mongoose";

interface NotificationPreferences {
  emailEnabled: boolean;
  reminderIntervals: string[];
}

interface UserDocument {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  moodleCalendarUrl?: string;
  admissionYear?: string;
  timezone: string;
  hasCompletedOnboarding: boolean;
  isVerified: boolean;
  verificationOtp?: string;
  verificationOtpExpiry?: Date;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: Date;
  isPhoneVerified: boolean;
  phoneOtp?: string;
  phoneOtpExpiry?: Date;
  notificationPreferences: NotificationPreferences;
  isPro: boolean;
  proExpiresAt: Date | null;
  trialStartedAt: Date | null;
  trialPhoneNumber: string | null;
  whatsappTrialUsed: number;
  lastWhatsappSentAt: Date | null;
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
    isVerified: { type: Boolean, required: true, default: false },
    verificationOtp: { type: String, required: false },
    verificationOtpExpiry: { type: Date, required: false },
    passwordResetToken: { type: String, required: false },
    passwordResetTokenExpiry: { type: Date, required: false },
    isPhoneVerified: { type: Boolean, required: true, default: false },
    phoneOtp: { type: String, required: false },
    phoneOtpExpiry: { type: Date, required: false },
    notificationPreferences: {
      emailEnabled: { type: Boolean, default: true },
      reminderIntervals: {
        type: [String],
        enum: ["3-day", "1-day", "day-of"],
        default: ["3-day", "1-day", "day-of"],
      },
    },
    isPro: { type: Boolean, required: true, default: false },
    proExpiresAt: { type: Date, default: null },
    trialStartedAt: { type: Date, default: null },
    trialPhoneNumber: { type: String, default: null },
    whatsappTrialUsed: { type: Number, required: true, default: 0 },
    lastWhatsappSentAt: { type: Date, default: null },
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

interface SubscriptionDocument {
  userId: mongoose.Types.ObjectId;
  plan: "monthly" | "semester";
  status: "pending" | "active" | "expired" | "rejected";
  amount: number;
  currency: string;
  startDate: Date | null;
  endDate: Date | null;
  transactionId: string;
  screenshotKey: string;
  paymentMethod: string;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const subscriptionSchema = new Schema<SubscriptionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    plan: { type: String, enum: ["monthly", "semester"], required: true },
    status: { type: String, enum: ["pending", "active", "expired", "rejected"], required: true, default: "pending", index: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "PKR" },
    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    transactionId: { type: String, required: true, trim: true },
    screenshotKey: { type: String, required: true },
    paymentMethod: { type: String, required: true, trim: true },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: String, default: null },
    rejectionReason: { type: String, default: null },
  },
  { timestamps: true }
);

interface DiscountCodeDocument {
  code: string;
  description: string;
  discountValue: number;
  applicablePlans: ("monthly" | "semester")[];
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const discountCodeSchema = new Schema<DiscountCodeDocument>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    description: { type: String, required: true, trim: true },
    discountValue: { type: Number, required: true },
    applicablePlans: {
      type: [String],
      enum: ["monthly", "semester"],
      required: true,
    },
    isActive: { type: Boolean, required: true, default: true },
    validFrom: { type: Date, default: null },
    validUntil: { type: Date, default: null },
    maxUses: { type: Number, default: null },
    usedCount: { type: Number, required: true, default: 0 },
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
deadlineSchema.index({ status: 1, isCompleted: 1, dueDate: 1 });

userSchema.index({ hasCompletedOnboarding: 1 });
userSchema.index({ passwordResetTokenExpiry: 1 }, { sparse: true });
userSchema.index({ isPro: 1, proExpiresAt: 1 });
userSchema.index({ lastWhatsappSentAt: 1 }, { sparse: true });

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

export const SubscriptionModel: Model<SubscriptionDocument> =
  mongoose.models.Subscription || mongoose.model<SubscriptionDocument>("Subscription", subscriptionSchema);

export const DiscountCodeModel: Model<DiscountCodeDocument> =
  mongoose.models.DiscountCode || mongoose.model<DiscountCodeDocument>("DiscountCode", discountCodeSchema);

// ---------------------------------------------------------------------------
// NotificationLog — one record per send attempt (email or WhatsApp)
// TTL: auto-deleted after 90 days via the sentAt index
// ---------------------------------------------------------------------------
interface NotificationLogDocument {
  userId: mongoose.Types.ObjectId;
  deadlineIds: mongoose.Types.ObjectId[];
  channel: "email" | "whatsapp";
  type: "reminder" | "overdue";
  status: "sent" | "failed";
  error?: string;
  sentAt: Date;
  createdAt: Date;
}

const notificationLogSchema = new Schema<NotificationLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    deadlineIds: [{ type: Schema.Types.ObjectId, ref: "Deadline" }],
    channel: { type: String, enum: ["email", "whatsapp"], required: true },
    type: { type: String, enum: ["reminder", "overdue"], required: true },
    status: { type: String, enum: ["sent", "failed"], required: true },
    error: { type: String },
    sentAt: { type: Date, required: true, index: { expireAfterSeconds: 90 * 24 * 60 * 60 } },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationLogSchema.index({ userId: 1, sentAt: -1 });
notificationLogSchema.index({ sentAt: -1 });

// ---------------------------------------------------------------------------
// CronRunLog — one record per cron execution
// TTL: auto-deleted after 60 days
// ---------------------------------------------------------------------------
interface CronRunLogDocument {
  runAt: Date;
  remindersSent: number;
  overduesSent: number;
  whatsappReminderSent: number;
  whatsappOverdueSent: number;
  errors: number;
  durationMs: number;
  createdAt: Date;
}

const cronRunLogSchema = new Schema<CronRunLogDocument>(
  {
    runAt: { type: Date, required: true, index: { expireAfterSeconds: 60 * 24 * 60 * 60 } },
    remindersSent: { type: Number, required: true, default: 0 },
    overduesSent: { type: Number, required: true, default: 0 },
    whatsappReminderSent: { type: Number, required: true, default: 0 },
    whatsappOverdueSent: { type: Number, required: true, default: 0 },
    errors: { type: Number, required: true, default: 0 },
    durationMs: { type: Number, required: true, default: 0 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const NotificationLogModel: Model<NotificationLogDocument> =
  mongoose.models.NotificationLog ||
  mongoose.model<NotificationLogDocument>("NotificationLog", notificationLogSchema);

export const CronRunLogModel: Model<CronRunLogDocument> =
  mongoose.models.CronRunLog ||
  mongoose.model<CronRunLogDocument>("CronRunLog", cronRunLogSchema);

export type { UserDocument, DeadlineDocument, CourseCatalogDocument, CourseCatalogEntry, NotificationPreferences, SubscriptionDocument, DiscountCodeDocument, NotificationLogDocument, CronRunLogDocument };
