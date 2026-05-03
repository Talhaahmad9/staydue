"use client";

import { motion } from "framer-motion";
import Link from "next/link";

interface MockCardProps {
  title: string;
  course: string;
  date: string;
  urgency: "today" | "tomorrow" | "upcoming";
  delay: number;
}

function MockDeadlineCard({ title, course, date, urgency, delay }: MockCardProps): React.ReactElement {
  const config = {
    today: {
      bg: "bg-urgency-today",
      border: "border-urgency-today-border",
      text: "text-urgency-today-text",
      label: "Due today",
    },
    tomorrow: {
      bg: "bg-urgency-tomorrow",
      border: "border-urgency-tomorrow-border",
      text: "text-urgency-tomorrow-text",
      label: "Due tomorrow",
    },
    upcoming: {
      bg: "bg-page-card",
      border: "border-line/50",
      text: "text-text-muted",
      label: "Upcoming",
    },
  }[urgency];

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className={`${config.bg} border ${config.border} rounded-xl p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-primary truncate">{title}</p>
          <p className="text-xs text-text-muted mt-0.5">{course}</p>
        </div>
        <span className={`${config.text} text-xs font-medium shrink-0`}>{config.label}</span>
      </div>
      <p className="text-xs text-text-muted mt-2">{date}</p>
    </motion.div>
  );
}

export default function HeroSection(): React.ReactElement {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: copy */}
        <div className="relative z-10 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            <span className="inline-block bg-brand-light border border-brand/40 text-brand text-xs font-medium px-3 py-1 rounded-full tracking-wide">
              For IOBM students
            </span>
          </motion.div>

          <motion.h1
            className="text-3xl md:text-4xl lg:text-6xl font-medium leading-tight text-text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Never miss a deadline again.
          </motion.h1>

          <motion.p
            className="text-sm font-medium text-brand tracking-wide lg:text-base"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.4 }}
          >
            Built by students, for students.
          </motion.p>

          <motion.p
            className="text-base lg:text-lg text-text-secondary leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Connect your Moodle calendar and get every assignment deadline organized in one
            dashboard — with WhatsApp and email reminders before due dates.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 pt-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
          >
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium px-5 py-2.5 transition-colors w-full sm:w-auto"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-lg border border-line hover:border-line-strong hover:bg-page-hover text-text-secondary hover:text-text-primary text-sm font-medium px-5 py-2.5 transition-colors w-full sm:w-auto"
            >
              Sign in
            </Link>
          </motion.div>
        </div>

        {/* Right: mockup dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="absolute inset-0 z-0 flex items-center opacity-[0.12] blur-sm pointer-events-none lg:relative lg:inset-auto lg:z-auto lg:opacity-100 lg:blur-none lg:pointer-events-auto w-full"
        >
          <div className="bg-page-surface border border-line/50 rounded-xl p-4 md:p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-medium uppercase tracking-widest text-text-muted">
                Your deadlines
              </p>
              <span className="bg-brand-light border border-brand/40 text-brand text-xs font-medium px-2.5 py-0.5 rounded-full">
                3 due soon
              </span>
            </div>
            <div className="space-y-3">
              <MockDeadlineCard
                title="Assignment 3 — Case Study Analysis"
                course="MKT301 · Marketing Management"
                date="Today, 11:59 PM"
                urgency="today"
                delay={0.45}
              />
              <MockDeadlineCard
                title="Lab Report — Experiment 5"
                course="CS201 · Data Structures"
                date="Tomorrow, 11:59 PM"
                urgency="tomorrow"
                delay={0.55}
              />
              <MockDeadlineCard
                title="Mid-Term Project Submission"
                course="FIN401 · Corporate Finance"
                date="Apr 22, 11:59 PM"
                urgency="upcoming"
                delay={0.65}
              />
            </div>
          </div>
          <motion.div
            className="flex items-center gap-2 px-1 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
            <p className="text-xs text-text-muted">WhatsApp reminder sent 3 hours ago</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
