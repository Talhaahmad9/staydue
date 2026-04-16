"use client";

import { motion } from "framer-motion";
import Link from "next/link";

const steps = [
  {
    number: "01",
    title: "Connect your Moodle calendar",
    description:
      "Paste your Moodle ICS export URL. StayDue fetches all your assignment deadlines and resolves course names from the university catalog.",
    link: { label: "How to find your URL", href: "/how-to-get-url" },
  },
  {
    number: "02",
    title: "View your dashboard",
    description:
      "All deadlines organized by urgency — due today, tomorrow, and upcoming — in a single view. Filter by course in one tap.",
  },
  {
    number: "03",
    title: "Get reminded before it's too late",
    description:
      "Receive WhatsApp and email reminders 3 days before, 1 day before, and on the day of each deadline. Overdue follow-ups if you miss one.",
  },
];

export default function HowItWorksSection(): React.ReactElement {
  return (
    <section id="how-it-works" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium mb-3">
          How it works
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-text-primary leading-tight">
          Up and running in minutes.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <div className="bg-page-card border border-line/50 rounded-xl p-5 hover:border-line-strong transition-colors h-full flex flex-col">
              <div className="mb-4">
                <span className="w-8 h-8 rounded-full bg-brand-light border border-brand/30 inline-flex items-center justify-center text-xs font-medium text-brand">
                  {step.number}
                </span>
              </div>
              <h3 className="text-sm md:text-base font-medium text-text-primary mb-2 leading-snug">
                {step.title}
              </h3>
              <p className="text-sm md:text-base text-text-secondary leading-relaxed flex-1">
                {step.description}
              </p>
              {step.link && (
                <Link
                  href={step.link.href}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover transition-colors mt-3"
                >
                  {step.link.label}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
