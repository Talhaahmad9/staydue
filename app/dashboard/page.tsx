import { redirect } from "next/navigation";

import DeadlineList from "@/components/dashboard/DeadlineList";
import { auth } from "@/lib/auth";
import { DeadlineModel, UserModel, connectToDatabase } from "@/lib/mongodb";

interface DashboardDeadline {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: string;
}

async function getDeadlines(userId: string): Promise<DashboardDeadline[]> {
  await connectToDatabase();
  const documents = await DeadlineModel.find({ userId, isCompleted: false })
    .sort({ dueDate: 1 })
    .limit(200)
    .lean();

  return documents.map((document) => ({
    id: document._id.toString(),
    title: document.title,
    courseCode: document.courseCode ?? document.course,
    courseTitle: document.courseTitle ?? "Uncategorized",
    dueDate: document.dueDate.toISOString(),
  }));
}

export default async function DashboardPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  await connectToDatabase();
  const user = await UserModel.findById(session.user.id).lean();
  if (!user?.admissionYear) {
    redirect("/onboarding");
  }

  const deadlines = await getDeadlines(session.user.id);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Your deadlines</h1>
        <p className="mt-2 text-sm text-gray-500">
          Stay on top of coursework with urgency-sorted reminders.
        </p>
      </div>
      <DeadlineList deadlines={deadlines} />
    </main>
  );
}
