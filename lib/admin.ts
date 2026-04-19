import { connectToDatabase, UserModel, SubscriptionModel, DeadlineModel, DiscountCodeModel } from "@/lib/mongodb";

export interface AdminOverviewStats {
  totalUsers: number;
  verifiedUsers: number;
  onboardedUsers: number;
  proUsers: number;
  trialUsers: number;
  freeUsers: number;
  pendingSubscriptions: number;
  totalRevenue: number;
  revenueThisMonth: number;
  totalDeadlines: number;
  signupsLast30Days: { date: string; count: number }[];
  tierBreakdown: { name: string; value: number }[];
}

export interface AdminCronStatus {
  lastNotifyRun: Date | null;
  lastRefreshRun: Date | null;
  lastExpireRun: Date | null;
}

export async function getAdminOverviewStats(): Promise<AdminOverviewStats> {
  await connectToDatabase();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    verifiedUsers,
    onboardedUsers,
    proUsers,
    pendingSubscriptions,
    revenueAgg,
    revenueMonthAgg,
    totalDeadlines,
    signupAgg,
    trialAgg,
  ] = await Promise.all([
    UserModel.countDocuments(),
    UserModel.countDocuments({ isVerified: true }),
    UserModel.countDocuments({ hasCompletedOnboarding: true }),
    UserModel.countDocuments({ isPro: true }),
    SubscriptionModel.countDocuments({ status: "pending" }),
    SubscriptionModel.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    SubscriptionModel.aggregate([
      { $match: { status: "active", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]),
    DeadlineModel.countDocuments(),
    // Signups per day over last 30 days
    UserModel.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Karachi" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    // Trial users: trialStartedAt set but not pro
    UserModel.countDocuments({
      trialStartedAt: { $ne: null },
      isPro: false,
    }),
  ]);

  const totalRevenue = revenueAgg[0]?.total ?? 0;
  const revenueThisMonth = revenueMonthAgg[0]?.total ?? 0;
  const trialUsers = trialAgg;
  const freeUsers = totalUsers - proUsers - trialUsers;

  // Build a full 30-day date series, filling 0 for days with no signups
  const signupMap = new Map<string, number>(
    signupAgg.map((d: { _id: string; count: number }) => [d._id, d.count])
  );
  const signupsLast30Days: { date: string; count: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }); // YYYY-MM-DD
    signupsLast30Days.push({ date: key, count: signupMap.get(key) ?? 0 });
  }

  const tierBreakdown = [
    { name: "Pro", value: proUsers },
    { name: "Trial", value: trialUsers },
    { name: "Free", value: Math.max(0, freeUsers) },
  ];

  return {
    totalUsers,
    verifiedUsers,
    onboardedUsers,
    proUsers,
    trialUsers,
    freeUsers: Math.max(0, freeUsers),
    pendingSubscriptions,
    totalRevenue,
    revenueThisMonth,
    totalDeadlines,
    signupsLast30Days,
    tierBreakdown,
  };
}

export interface AdminSub {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: string;
  amount: number;
  currency: string;
  transactionId: string;
  paymentMethod: string;
  screenshotKey: string;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
}

export async function getAdminSubscriptions(
  status?: string,
  page = 1,
  limit = 20
): Promise<{ subscriptions: AdminSub[]; total: number }> {
  await connectToDatabase();

  const filter = status && status !== "all" ? { status } : {};
  const skip = (page - 1) * limit;

  const [rawSubs, total] = await Promise.all([
    SubscriptionModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ userId: { _id: { toString(): string }; name: string; email: string } }>(
        "userId",
        "name email"
      )
      .lean(),
    SubscriptionModel.countDocuments(filter),
  ]);

  const subscriptions: AdminSub[] = rawSubs.map((s) => {
    const user = s.userId as { _id: { toString(): string }; name: string; email: string } | null;
    return {
      id: s._id.toString(),
      userId: user?._id?.toString() ?? "",
      userName: user?.name ?? "Unknown",
      userEmail: user?.email ?? "Unknown",
      plan: s.plan,
      status: s.status,
      amount: s.amount,
      currency: s.currency,
      transactionId: s.transactionId,
      paymentMethod: s.paymentMethod,
      screenshotKey: s.screenshotKey,
      rejectionReason: s.rejectionReason,
      reviewedAt: s.reviewedAt,
      reviewedBy: s.reviewedBy,
      startDate: s.startDate,
      endDate: s.endDate,
      createdAt: s.createdAt,
    };
  });

  return { subscriptions, total };
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  isPro: boolean;
  proExpiresAt: Date | null;
  trialStartedAt: Date | null;
  whatsappTrialUsed: number;
  hasCompletedOnboarding: boolean;
  isVerified: boolean;
  hasPhone: boolean;
  hasCalendarUrl: boolean;
  admissionYear: string | null;
  createdAt: Date;
}

export async function getAdminUsers(
  filter: { tier?: string; onboarded?: string; search?: string },
  page = 1,
  limit = 30
): Promise<{ users: AdminUser[]; total: number }> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  if (filter.tier === "pro") query.isPro = true;
  if (filter.tier === "trial") { query.trialStartedAt = { $ne: null }; query.isPro = false; }
  if (filter.tier === "free") { query.isPro = false; query.trialStartedAt = null; }
  if (filter.onboarded === "yes") query.hasCompletedOnboarding = true;
  if (filter.onboarded === "no") query.hasCompletedOnboarding = false;
  if (filter.search) {
    query.$or = [
      { name: { $regex: filter.search, $options: "i" } },
      { email: { $regex: filter.search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [rawUsers, total] = await Promise.all([
    UserModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("name email isPro proExpiresAt trialStartedAt whatsappTrialUsed hasCompletedOnboarding isVerified phone moodleCalendarUrl admissionYear createdAt")
      .lean(),
    UserModel.countDocuments(query),
  ]);

  const users: AdminUser[] = rawUsers.map((u) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    isPro: u.isPro,
    proExpiresAt: u.proExpiresAt ?? null,
    trialStartedAt: u.trialStartedAt ?? null,
    whatsappTrialUsed: u.whatsappTrialUsed,
    hasCompletedOnboarding: u.hasCompletedOnboarding,
    isVerified: u.isVerified,
    hasPhone: !!u.phone,
    hasCalendarUrl: !!u.moodleCalendarUrl,
    admissionYear: u.admissionYear ?? null,
    createdAt: u.createdAt,
  }));

  return { users, total };
}

export interface AdminDiscount {
  id: string;
  code: string;
  description: string;
  discountValue: number;
  applicablePlans: string[];
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  maxUses: number | null;
  usedCount: number;
  createdAt: Date;
}

export async function getAdminDiscountCodes(): Promise<AdminDiscount[]> {
  await connectToDatabase();
  const codes = await DiscountCodeModel.find().sort({ createdAt: -1 }).lean();
  return codes.map((c) => ({
    id: c._id.toString(),
    code: c.code,
    description: c.description,
    discountValue: c.discountValue,
    applicablePlans: c.applicablePlans,
    isActive: c.isActive,
    validFrom: c.validFrom,
    validUntil: c.validUntil,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    createdAt: c.createdAt,
  }));
}

export interface AdminUserDetail extends AdminUser {
  phone: string | null;
  calendarUrl: string | null;
  timezone: string;
  notificationEmailEnabled: boolean;
  reminderIntervals: string[];
  subscriptions: AdminSub[];
  deadlineCount: number;
  overdueCount: number;
  doneCount: number;
}

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  await connectToDatabase();

  let objectId;
  try {
    const mongoose = await import("mongoose");
    objectId = new mongoose.Types.ObjectId(userId);
  } catch {
    return null;
  }

  const [user, subscriptions, deadlineCounts] = await Promise.all([
    UserModel.findById(objectId)
      .select("name email isPro proExpiresAt trialStartedAt whatsappTrialUsed hasCompletedOnboarding isVerified phone moodleCalendarUrl admissionYear timezone notificationPreferences createdAt updatedAt")
      .lean(),
    SubscriptionModel.find({ userId: objectId }).sort({ createdAt: -1 }).lean(),
    DeadlineModel.aggregate([
      { $match: { userId: objectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  if (!user) return null;

  const countMap: Record<string, number> = {};
  for (const row of deadlineCounts) {
    countMap[row._id as string] = row.count as number;
  }

  const mappedSubs: AdminSub[] = subscriptions.map((s) => ({
    id: s._id.toString(),
    userId: s.userId.toString(),
    userName: user.name,
    userEmail: user.email,
    plan: s.plan,
    status: s.status,
    amount: s.amount,
    currency: s.currency,
    transactionId: s.transactionId,
    paymentMethod: s.paymentMethod,
    screenshotKey: s.screenshotKey,
    rejectionReason: s.rejectionReason,
    reviewedAt: s.reviewedAt,
    reviewedBy: s.reviewedBy,
    startDate: s.startDate,
    endDate: s.endDate,
    createdAt: s.createdAt,
  }));

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    isPro: user.isPro,
    proExpiresAt: user.proExpiresAt ?? null,
    trialStartedAt: user.trialStartedAt ?? null,
    whatsappTrialUsed: user.whatsappTrialUsed,
    hasCompletedOnboarding: user.hasCompletedOnboarding,
    isVerified: user.isVerified,
    hasPhone: !!user.phone,
    hasCalendarUrl: !!user.moodleCalendarUrl,
    admissionYear: user.admissionYear ?? null,
    createdAt: user.createdAt,
    phone: user.phone ? `***${user.phone.slice(-4)}` : null,
    calendarUrl: user.moodleCalendarUrl ? "[set]" : null,
    timezone: user.timezone,
    notificationEmailEnabled: user.notificationPreferences?.emailEnabled ?? true,
    reminderIntervals: user.notificationPreferences?.reminderIntervals ?? [],
    subscriptions: mappedSubs,
    deadlineCount: (countMap["upcoming"] ?? 0) + (countMap["overdue"] ?? 0) + (countMap["done"] ?? 0),
    overdueCount: countMap["overdue"] ?? 0,
    doneCount: countMap["done"] ?? 0,
  };
}

export interface RevenueByMonth {
  month: string;   // "Jan 2026"
  monthly: number;
  semester: number;
  total: number;
}

export interface AdminRevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  revenueThisMonth: number;
  transactionsThisMonth: number;
  monthlyPlanRevenue: number;
  semesterPlanRevenue: number;
  revenueByMonth: RevenueByMonth[];
  planSplit: { name: string; value: number }[];
}

export async function getAdminRevenueStats(): Promise<AdminRevenueStats> {
  await connectToDatabase();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const [totalAgg, monthAgg, planAgg, byMonthAgg] = await Promise.all([
    SubscriptionModel.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    SubscriptionModel.aggregate([
      { $match: { status: "active", createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
    ]),
    SubscriptionModel.aggregate([
      { $match: { status: "active" } },
      { $group: { _id: "$plan", total: { $sum: "$amount" } } },
    ]),
    SubscriptionModel.aggregate([
      { $match: { status: "active", createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: { date: "$createdAt", timezone: "Asia/Karachi" } },
            month: { $month: { date: "$createdAt", timezone: "Asia/Karachi" } },
            plan: "$plan",
          },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
  ]);

  const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  // Build 12-month series
  const monthMap = new Map<string, { monthly: number; semester: number }>();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
    monthMap.set(key, { monthly: 0, semester: 0 });
  }

  for (const row of byMonthAgg) {
    const key = `${MONTH_NAMES[(row._id.month as number) - 1]} ${row._id.year}`;
    if (monthMap.has(key)) {
      const entry = monthMap.get(key)!;
      if (row._id.plan === "monthly") entry.monthly += row.total as number;
      else entry.semester += row.total as number;
    }
  }

  const revenueByMonth: RevenueByMonth[] = Array.from(monthMap.entries()).map(([month, v]) => ({
    month,
    monthly: v.monthly,
    semester: v.semester,
    total: v.monthly + v.semester,
  }));

  const planMap = new Map<string, number>(
    planAgg.map((p: { _id: string; total: number }) => [p._id, p.total])
  );

  return {
    totalRevenue: totalAgg[0]?.total ?? 0,
    totalTransactions: totalAgg[0]?.count ?? 0,
    revenueThisMonth: monthAgg[0]?.total ?? 0,
    transactionsThisMonth: monthAgg[0]?.count ?? 0,
    monthlyPlanRevenue: planMap.get("monthly") ?? 0,
    semesterPlanRevenue: planMap.get("semester") ?? 0,
    revenueByMonth,
    planSplit: [
      { name: "Monthly", value: planMap.get("monthly") ?? 0 },
      { name: "Semester", value: planMap.get("semester") ?? 0 },
    ],
  };
}

export interface NotificationSendsByDay {
  date: string;
  count: number;
}

export interface AdminNotificationStats {
  totalReminderSends: number;
  reminderSendsLast7Days: number;
  totalOverdueSends: number;
  usersWithEmailDisabled: number;
  usersWithPhone: number;
  totalWhatsappTrialUsed: number;
  sendsByDay: NotificationSendsByDay[];
}

export async function getAdminNotificationStats(): Promise<AdminNotificationStats> {
  await connectToDatabase();

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    reminderTotals,
    recentReminderCount,
    overdueAgg,
    emailDisabledCount,
    phoneCount,
    whatsappAgg,
    sendsByDayAgg,
  ] = await Promise.all([
    // Total reminder sends = sum of array lengths
    DeadlineModel.aggregate([
      { $project: { count: { $size: "$reminderSentDates" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]),
    // Reminders sent in the last 7 days
    DeadlineModel.aggregate([
      { $project: { recent: { $filter: { input: "$reminderSentDates", as: "d", cond: { $gte: ["$$d", sevenDaysAgo] } } } } },
      { $project: { count: { $size: "$recent" } } },
      { $group: { _id: null, total: { $sum: "$count" } } },
    ]),
    // Total overdue notifications
    DeadlineModel.aggregate([
      { $group: { _id: null, total: { $sum: "$overdueNotificationCount" } } },
    ]),
    UserModel.countDocuments({ "notificationPreferences.emailEnabled": false }),
    UserModel.countDocuments({ phone: { $ne: null, $exists: true } }),
    // Sum of whatsapp trial messages used
    UserModel.aggregate([
      { $group: { _id: null, total: { $sum: "$whatsappTrialUsed" } } },
    ]),
    // Sends per day over last 30 days
    DeadlineModel.aggregate([
      { $unwind: "$reminderSentDates" },
      { $match: { reminderSentDates: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$reminderSentDates", timezone: "Asia/Karachi" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Build full 30-day date series
  const dayMap = new Map<string, number>(
    sendsByDayAgg.map((d: { _id: string; count: number }) => [d._id, d.count])
  );
  const sendsByDay: NotificationSendsByDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });
    sendsByDay.push({ date: key, count: dayMap.get(key) ?? 0 });
  }

  return {
    totalReminderSends: reminderTotals[0]?.total ?? 0,
    reminderSendsLast7Days: recentReminderCount[0]?.total ?? 0,
    totalOverdueSends: overdueAgg[0]?.total ?? 0,
    usersWithEmailDisabled: emailDisabledCount,
    usersWithPhone: phoneCount,
    totalWhatsappTrialUsed: whatsappAgg[0]?.total ?? 0,
    sendsByDay,
  };
}

export interface AdminSystemHealth {
  expiredProCount: number;
  onboardedWithoutCalendar: number;
  deadlineStatusCounts: { upcoming: number; overdue: number; done: number };
  lastDeadlineCreatedAt: Date | null;
  totalDiscountUsed: number;
  totalUsers: number;
  totalVerifiedUsers: number;
  orphanedPendingSubs: number;
}

export async function getAdminSystemHealth(): Promise<AdminSystemHealth> {
  await connectToDatabase();

  const now = new Date();

  const [
    expiredPro,
    onboardedNoUrl,
    deadlineStatuses,
    lastDeadline,
    discountAgg,
    totalUsers,
    verifiedUsers,
    orphanedPending,
  ] = await Promise.all([
    // Users who are isPro but proExpiresAt is in the past
    UserModel.countDocuments({ isPro: true, proExpiresAt: { $lt: now } }),
    // Users who completed onboarding but have no calendar URL
    UserModel.countDocuments({ hasCompletedOnboarding: true, $or: [{ moodleCalendarUrl: { $exists: false } }, { moodleCalendarUrl: null }, { moodleCalendarUrl: "" }] }),
    // Deadline status breakdown
    DeadlineModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    // Most recently created deadline (proxy for last calendar sync activity)
    DeadlineModel.findOne().sort({ createdAt: -1 }).select("createdAt").lean(),
    // Total times discount codes have been used
    DiscountCodeModel.aggregate([
      { $group: { _id: null, total: { $sum: "$usedCount" } } },
    ]),
    UserModel.countDocuments(),
    UserModel.countDocuments({ isVerified: true }),
    // Pending subs older than 7 days (possibly stale / user abandoned)
    SubscriptionModel.countDocuments({ status: "pending", createdAt: { $lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),
  ]);

  const statusMap: Record<string, number> = {};
  for (const row of deadlineStatuses) {
    statusMap[row._id as string] = row.count as number;
  }

  return {
    expiredProCount: expiredPro,
    onboardedWithoutCalendar: onboardedNoUrl,
    deadlineStatusCounts: {
      upcoming: statusMap["upcoming"] ?? 0,
      overdue: statusMap["overdue"] ?? 0,
      done: statusMap["done"] ?? 0,
    },
    lastDeadlineCreatedAt: lastDeadline ? lastDeadline.createdAt : null,
    totalDiscountUsed: discountAgg[0]?.total ?? 0,
    totalUsers,
    totalVerifiedUsers: verifiedUsers,
    orphanedPendingSubs: orphanedPending,
  };
}
