import Link from "next/link";
import { redirect } from "next/navigation";

import SignupForm from "@/components/auth/SignupForm";
import PageTransition from "@/components/shared/PageTransition";
import { auth } from "@/lib/auth";

export default async function SignupPage(): Promise<React.ReactElement> {
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
                Create account
              </p>
              <h1 className="text-2xl font-medium text-text-primary">
                Create your workspace for deadlines.
              </h1>
              <p className="text-sm text-text-secondary leading-relaxed">
                Start with one account and connect your calendar to get deadline tracking and reminder delivery in one flow.
              </p>
            </div>

            <SignupForm />

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-brand hover:text-brand-hover font-medium transition-colors"
              >
                Sign in
              </Link>
            </p>
          </section>
        </div>
      </main>
    </PageTransition>
  );
}
