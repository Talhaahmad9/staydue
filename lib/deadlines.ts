import { DeadlineModel, connectToDatabase } from "@/lib/mongodb";

interface DashboardDeadline {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: string;
  status: "upcoming" | "done" | "overdue";
}

export async function getDeadlinesForUser(userId: string): Promise<{
  active: DashboardDeadline[];
  overdue: DashboardDeadline[];
  done: DashboardDeadline[];
}> {
  await connectToDatabase();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Mark newly overdue deadlines (past due date but not yet marked as overdue)
  await DeadlineModel.updateMany(
    {
      userId,
      isCompleted: false,
      status: "upcoming",
      dueDate: { $lt: now },
    },
    { status: "overdue" }
  );

  // Fetch active deadlines (upcoming, not done)
  const activeDocuments = await DeadlineModel.find({
    userId,
    isCompleted: false,
    status: "upcoming",
    dueDate: { $gte: now },
  })
    .sort({ dueDate: 1 })
    .lean();

  // Fetch overdue deadlines (overdue, within 30 days, not done)
  const overdueDocuments = await DeadlineModel.find({
    userId,
    isCompleted: false,
    status: "overdue",
    dueDate: { $gte: thirtyDaysAgo },
  })
    .sort({ dueDate: -1 })
    .lean();

  // Fetch done deadlines (done, within 30 days, sorted descending by doneAt)
  const doneDocuments = await DeadlineModel.find({
    userId,
    isCompleted: true,
    status: "done",
    dueDate: { $gte: thirtyDaysAgo },
  })
    .sort({ doneAt: -1 })
    .lean();

  const active = activeDocuments.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    courseCode: doc.courseCode ?? doc.course,
    courseTitle: doc.courseTitle ?? "Uncategorized",
    dueDate: doc.dueDate.toISOString(),
    status: doc.status as "upcoming" | "done" | "overdue",
  }));

  const overdue = overdueDocuments.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    courseCode: doc.courseCode ?? doc.course,
    courseTitle: doc.courseTitle ?? "Uncategorized",
    dueDate: doc.dueDate.toISOString(),
    status: doc.status as "upcoming" | "done" | "overdue",
  }));

  const done = doneDocuments.map((doc) => ({
    id: doc._id.toString(),
    title: doc.title,
    courseCode: doc.courseCode ?? doc.course,
    courseTitle: doc.courseTitle ?? "Uncategorized",
    dueDate: doc.dueDate.toISOString(),
    status: doc.status as "upcoming" | "done" | "overdue",
  }));

  return { active, overdue, done };
}
