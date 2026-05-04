import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Image from "next/image";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};
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

  // Admin accounts skip onboarding entirely
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (session.user.email && adminEmails.includes(session.user.email)) {
    redirect("/admin");
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
      <nav className="h-14 border-b border-line/50 bg-page-surface/80 backdrop-blur-sm sticky top-0 z-50 flex items-center px-6">
        <Image src="/staydue_logo.svg" alt="StayDue" width={160} height={54} priority className="h-auto w-[100px] md:w-[120px]" />
      </nav>
      <main className="min-h-screen bg-page-bg">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-medium text-text-primary">Set up your account</h1>
            <p className="mt-2 text-sm text-text-secondary">
              Connect your Moodle calendar to import deadlines, then optionally add WhatsApp reminders.
            </p>
          </div>
          <OnboardingSteps admissionYears={admissionYears} />
        </div>
      </main>
    </PageTransition>
  );
}
