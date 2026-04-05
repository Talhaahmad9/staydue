import { redirect } from "next/navigation";

import OnboardingSteps from "@/components/onboarding/OnboardingSteps";
import PageTransition from "@/components/shared/PageTransition";
import { auth } from "@/lib/auth";
import { getAvailableCatalogYears } from "@/lib/catalog";
import { UserModel, connectToDatabase } from "@/lib/mongodb";

export default async function OnboardingPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  // Check if user is verified
  if (session.user.isVerified === false) {
    redirect(`/verify-email?email=${encodeURIComponent(session.user.email ?? "")}`);
  }

  await connectToDatabase();
  const user = await UserModel.findById(session.user.id).lean();

  if (user?.hasCompletedOnboarding && user.admissionYear) {
    redirect("/dashboard");
  }

  const admissionYears = await getAvailableCatalogYears();
  if (admissionYears.length === 0) {
    throw new Error("Course catalogs are not configured yet.");
  }

  return (
    <PageTransition>
      <nav className="h-14 border-b border-line/50 bg-page-surface/80 backdrop-blur-sm sticky top-0 z-50 flex items-center px-6 gap-4">
        <div className="text-sm font-medium text-text-primary">StayDue</div>
      </nav>
      <main className="min-h-screen bg-page-bg">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-text-primary">Set up your reminders</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Select your admission year and connect your calendar to import accurate course deadlines.
            </p>
          </div>
          <OnboardingSteps admissionYears={admissionYears} />
        </div>
      </main>
    </PageTransition>
  );
}
