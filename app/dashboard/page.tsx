import { redirect } from "next/navigation";

import DeadlineList from "@/components/dashboard/DeadlineList";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import PageTransition from "@/components/shared/PageTransition";
import { auth } from "@/lib/auth";
import { UserModel, connectToDatabase } from "@/lib/mongodb";
import { getDeadlinesForUser } from "@/lib/deadlines";

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

  const { active, overdue, done } = await getDeadlinesForUser(session.user.id);
  const userInitials = (session.user.name ?? "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <PageTransition>
      <div className="flex min-h-screen bg-page-bg lg:bg-page-surface">
        <DashboardSidebar userInitials={userInitials} userName={session.user.name ?? "User"} />

        <div className="flex-1 flex flex-col lg:bg-page-bg">
          <nav className="h-14 border-b border-line/50 bg-page-surface/80 backdrop-blur-sm sticky top-0 z-40 flex items-center px-4 sm:px-6 gap-4 lg:bg-page-bg lg:border-line">
            <h1 className="text-lg font-medium text-text-primary">Your deadlines</h1>
            <div className="ml-auto flex items-center gap-3">
              <a
                href="/settings"
                className="text-sm text-text-secondary hover:text-text-primary transition-colors"
              >
                Settings
              </a>
            </div>
          </nav>

          <main className="flex-1 overflow-y-auto p-4 sm:p-6">
            <DeadlineList deadlines={active} overdueDeadlines={overdue} doneDeadlines={done} />
          </main>
        </div>
      </div>
    </PageTransition>
  );
}
