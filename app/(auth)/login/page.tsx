import Link from "next/link";
import { redirect } from "next/navigation";

import LoginForm from "@/components/auth/LoginForm";
import PageTransition from "@/components/shared/PageTransition";
import { auth } from "@/lib/auth";

export default async function LoginPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/onboarding");
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-page-bg px-4 py-8 flex items-center justify-center">
        <div className="w-full max-w-md">
          <section className="space-y-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest text-text-muted font-medium">
                Sign In
              </p>
              <h1 className="text-2xl font-medium text-text-primary">
                Keep every deadline in view.
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                Sign in to sync Moodle deadlines, track urgency, and receive reminders without manual planning.
              </p>
            </div>

            <LoginForm />

            <p className="text-center text-sm text-text-secondary">
              New to StayDue?{" "}
              <Link
                href="/signup"
                className="text-brand hover:text-brand-hover font-medium transition-colors"
              >
                Create an account
              </Link>
            </p>
          </section>
        </div>
      </main>
    </PageTransition>
  );
}
