import type { Metadata } from "next";
import StaticPageLayout from "@/components/landing/StaticPageLayout";

export const metadata: Metadata = {
  title: "About",
  description:
    "StayDue is a deadline reminder app built for university students on Moodle-based learning systems.",
};

export default function AboutPage(): React.ReactElement {
  return (
    <StaticPageLayout>
      <div className="space-y-2 mb-10">
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium">About</p>
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-medium text-text-primary leading-tight">
          About StayDue
        </h1>
      </div>

      <div className="space-y-10 text-sm md:text-base text-text-secondary leading-relaxed">
        <div className="space-y-4">
          <h2 className="text-base md:text-lg font-medium text-text-primary">The problem</h2>
          <p>
            Moodle is where your university posts every assignment, quiz, lab report, and project
            deadline — and Moodle sends zero push notifications. You either check it daily and
            hope you didn&apos;t miss something, keep a manual spreadsheet that goes out of date,
            or you miss things. For students managing six to eight courses simultaneously, this is
            a real and recurring problem every semester.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-base md:text-lg font-medium text-text-primary">How it started</h2>
          <p>
            StayDue was built by{" "}
            <a
              href="https://talhaahmad.me"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand hover:text-brand-hover transition-colors font-medium"
            >
              Talha Ahmad
            </a>
            , a student at IOBM in Karachi, after missing a
            deadline because it was buried three pages deep inside a Moodle course. Moodle has an
            ICS calendar export that almost no one uses — but it turns out that URL contains every
            deadline for every course in a machine-readable format. StayDue reads that feed,
            resolves course names from the university catalog, and sends reminders to your WhatsApp
            and email before deadlines arrive.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="text-base md:text-lg font-medium text-text-primary">What it does</h2>
          <ul className="space-y-2">
            {[
              "Fetches your Moodle deadlines automatically via your ICS export URL",
              "Resolves raw course codes to full, human-readable course names",
              "Shows all deadlines in a single dashboard, color-coded by how close they are",
              "Sends WhatsApp and email reminders 3 days before, 1 day before, and on the day of",
              "Sends overdue follow-up notices if a deadline has already passed",
              "Keeps your calendar in sync — new deadlines appear automatically",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-brand mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-base md:text-lg font-medium text-text-primary">Built by one person</h2>
          <p>
            StayDue is a solo project, currently serving IOBM students. It is not a startup, not
            a team, not a portfolio exercise — just a practical tool built to solve a specific
            problem that affects every student on a Moodle-based system. It runs in production,
            handles real data, and is actively maintained.
          </p>
        </div>

        <div className="space-y-4 border-t border-line-subtle pt-10">
          <h2 className="text-base md:text-lg font-medium text-text-primary">Contact</h2>
          <p>
            For questions, feedback, or anything else, reach out at:{" "}
            <span className="text-brand">contact@staydue.app</span>
          </p>
        </div>
      </div>
    </StaticPageLayout>
  );
}
