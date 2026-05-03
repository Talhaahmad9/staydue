"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function PricingSection(): React.ReactElement {
  return (
    <section id="pricing" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium mb-3">
          Pricing
        </p>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-text-primary leading-tight">
          Simple pricing for students.
        </h2>
        <p className="text-sm md:text-base text-text-secondary mt-3 max-w-xl leading-relaxed">
          Email reminders are always free. Pay once per period if you want WhatsApp reminders —
          no recurring charges, no hidden fees.
        </p>
      </motion.div>

      {/* Trial callout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.05, duration: 0.4 }}
        className="mb-6 rounded-xl border border-brand/30 bg-brand-light px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4"
      >
        <span className="w-2 h-2 rounded-full bg-brand shrink-0 hidden sm:block" />
        <p className="text-sm text-text-secondary leading-relaxed">
          <span className="font-medium text-brand">30-day free WhatsApp trial</span> — verify your
          phone number and get WhatsApp reminders free for 30 days. No payment needed to try it.
        </p>
      </motion.div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Free */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="bg-page-card border border-line/50 rounded-xl p-6 flex flex-col gap-5"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted font-medium mb-2">
              Free
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-medium text-text-primary">PKR 0</span>
              <span className="text-sm text-text-muted">/ forever</span>
            </div>
          </div>
          <ul className="space-y-2.5 flex-1">
            {[
              "Email reminders (3-day, 1-day, day-of)",
              "Overdue follow-up via email",
              "Full deadline dashboard",
              "Auto Moodle calendar sync",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-brand mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-line hover:border-line-strong hover:bg-page-hover text-text-secondary hover:text-text-primary text-sm font-medium px-4 py-2.5 transition-colors"
          >
            Get started
          </Link>
        </motion.div>

        {/* Monthly */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="bg-page-card border border-line/50 rounded-xl p-6 flex flex-col gap-5"
        >
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted font-medium mb-2">
              Monthly
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-medium text-text-primary">PKR 300</span>
              <span className="text-sm text-text-muted">/ month</span>
            </div>
          </div>
          <ul className="space-y-2.5 flex-1">
            {[
              "Everything in Free",
              "WhatsApp reminders (3-day, 1-day, day-of)",
              "Overdue follow-up via WhatsApp",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-brand mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg border border-line hover:border-line-strong hover:bg-page-hover text-text-secondary hover:text-text-primary text-sm font-medium px-4 py-2.5 transition-colors"
          >
            Get started
          </Link>
        </motion.div>

        {/* Semester */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-page-card border border-brand/40 rounded-xl p-6 flex flex-col gap-5 relative"
        >
          <span className="absolute -top-3 left-5 bg-brand text-white text-xs font-medium px-3 py-1 rounded-full">
            Best value
          </span>
          <div>
            <p className="text-xs uppercase tracking-widest text-text-muted font-medium mb-2">
              Semester (4 months)
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-medium text-text-primary">PKR 1,000</span>
              <span className="text-sm text-text-muted">/ semester</span>
            </div>
            <p className="text-xs text-brand mt-1.5">Save PKR 200 compared to monthly</p>
          </div>
          <ul className="space-y-2.5 flex-1">
            {[
              "Everything in Monthly",
              "Covers the full semester",
              "No mid-semester renewals",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-text-secondary">
                <span className="text-brand mt-0.5 shrink-0">✓</span>
                {item}
              </li>
            ))}
          </ul>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-4 py-2.5 transition-colors"
          >
            Get started
          </Link>
        </motion.div>
      </div>

      {/* Payment methods */}
      <motion.p
        className="mt-5 text-xs text-text-muted"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.25, duration: 0.4 }}
      >
        Accepted payment methods: JazzCash · Easypaisa · Bank transfer — manual review within 24
        hours.
      </motion.p>
    </section>
  );
}
