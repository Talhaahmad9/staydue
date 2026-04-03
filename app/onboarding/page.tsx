import { redirect } from "next/navigation";

import OnboardingSteps from "@/components/onboarding/OnboardingSteps";
import { auth } from "@/lib/auth";
import { getAvailableCatalogYears } from "@/lib/catalog";
import { UserModel, connectToDatabase } from "@/lib/mongodb";

export default async function OnboardingPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
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
    <main className="mx-auto min-h-screen w-full max-w-5xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Set up your reminders</h1>
        <p className="mt-2 text-sm text-gray-500">
          Select your admission year and connect your calendar to import accurate course deadlines.
        </p>
      </div>
      <OnboardingSteps admissionYears={admissionYears} />
    </main>
  );
}
