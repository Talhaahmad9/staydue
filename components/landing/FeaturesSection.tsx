"use client";

import { motion } from "framer-motion";

interface Feature {
  title: string;
  description: string;
  badge?: string;
  cta?: { label: string; href: string };
}

const features: Feature[] = [
  {
    title: "Auto deadline import",
    description:
      "Paste your Moodle URL once. StayDue continuously syncs your calendar and adds new deadlines as they appear throughout the semester.",
  },
  {
    title: "Full course names resolved",
    description:
      "Raw Moodle event titles become clean, readable entries — course codes and full names resolved from the IOBM course catalog.",
  },
  {
    title: "WhatsApp reminders",
    badge: "Pro",
    description:
      "Get notified on WhatsApp at 3 days before, 1 day before, and on the day of every assignment deadline.",
  },
  {
    title: "Overdue follow-up notices",
    description:
      "If a deadline slips, StayDue tracks it — sending follow-up notices over the next week so nothing falls through the cracks entirely.",
  },
  {
    title: "Urgency dashboard",
    description:
      "Deadlines color-coded by proximity. Due today in red, tomorrow in amber, upcoming in neutral. No mental effort required.",
  },
  {
    title: "Works with any Moodle",
    description:
      "StayDue reads the standard Moodle ICS calendar export format. Your university uses Moodle too? Help the developer add support for it.",
    cta: { label: "Get in touch", href: "mailto:contact@staydue.app" },
  },
];

export default function FeaturesSection(): React.ReactElement {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium mb-3">
          Features
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-text-primary leading-tight">
          Everything you need to stay on top.
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07, duration: 0.4 }}
            className="bg-page-card border border-line/50 rounded-xl p-5 hover:border-line-strong transition-colors flex flex-col"
          >
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-sm md:text-base font-medium text-text-primary">{feature.title}</h3>
              {feature.badge && (
                <span className="bg-brand-light border border-brand/40 text-brand text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {feature.badge}
                </span>
              )}
            </div>
            <p className="text-sm md:text-base text-text-secondary leading-relaxed flex-1">
              {feature.description}
            </p>
            {feature.cta && (
              <a
                href={feature.cta.href}
                className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover transition-colors mt-3"
              >
                {feature.cta.label}
                <span aria-hidden="true">→</span>
              </a>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
