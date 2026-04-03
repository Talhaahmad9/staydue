import Link from "next/link";
import { redirect } from "next/navigation";

import SignupForm from "@/components/auth/SignupForm";
import { auth } from "@/lib/auth";

export default async function SignupPage(): Promise<React.ReactElement> {
  const session = await auth();
  if (session?.user?.id) {
    redirect("/onboarding");
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-8 sm:px-6 sm:py-10">
      <div className="pointer-events-none absolute -left-24 bottom-12 h-60 w-60 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-16 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl" />

      <div className="mx-auto grid min-h-[85vh] w-full max-w-6xl items-center gap-8 lg:grid-cols-2 lg:gap-12">
        <section className="hidden space-y-5 rounded-3xl border border-slate-200 bg-white p-8 text-slate-900 lg:block">
          <p className="inline-flex rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-700">
            StayDue Onboarding
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900">Create your workspace for deadlines.</h1>
          <p className="text-sm leading-6 text-slate-600">
            Start with one account and connect your calendar to get deadline tracking and reminder
            delivery in one flow.
          </p>
        </section>

        <section className="w-full">
          <SignupForm />
          <p className="mt-4 text-center text-sm text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-600 transition-colors hover:text-teal-700">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
