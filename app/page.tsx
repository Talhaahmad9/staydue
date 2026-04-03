import Link from "next/link";

export default function Home(): React.ReactElement {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-10">
      <section className="grid w-full gap-10 rounded-3xl border border-teal-100 bg-gradient-to-br from-white via-teal-50 to-cyan-50 p-8 md:grid-cols-2 md:p-12">
        <div className="space-y-5">
          <p className="inline-block rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-teal-800">
            StayDue
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-gray-900 md:text-5xl">
            Never miss a university deadline again.
          </h1>
          <p className="max-w-lg text-base text-gray-600">
            Connect your Moodle calendar and get assignment deadlines organized in one dashboard,
            then receive reminders before due dates.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-lg bg-teal-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-teal-700"
            >
              Create account
            </Link>
            <Link
              href="/login"
              className="rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="rounded-2xl border border-white/80 bg-white/70 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold text-gray-900">First milestone in progress</h2>
          <ul className="mt-4 space-y-3 text-sm text-gray-600">
            <li>Credential authentication and session setup</li>
            <li>Moodle calendar import endpoint with ICS parsing</li>
            <li>Deadline dashboard with urgency highlighting</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
