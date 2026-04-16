"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Does StayDue work with IOBM Moodle?",
    answer:
      "Yes. StayDue was built specifically for IOBM students using lms.iobm.edu.pk. The course catalog covers batches from 2020 onwards, and course codes and full names are resolved automatically based on your admission year.",
  },
  {
    question: "How do I get my Moodle calendar URL?",
    answer:
      "Log in to IOBM Moodle, go to Calendar, scroll to the bottom and click \"Export calendar\". Select \"All events\" and \"All courses\", then click \"Get calendar URL\" and copy it. We have a full step-by-step guide with screenshots — link in the footer.",
  },
  {
    question: "What reminders will I receive?",
    answer:
      "By default you get reminders 3 days before a deadline, 1 day before, and on the day of. If a deadline passes, StayDue sends overdue follow-up notices over the next several days so you can still submit late if the option exists.",
  },
  {
    question: "Is my Moodle data safe?",
    answer:
      "StayDue reads your public calendar export URL — the same data any calendar app would see. We do not store your Moodle credentials, cannot access your Moodle account, and cannot read assignment files or submissions. Your URL and deadline data are encrypted at rest.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "JazzCash, Easypaisa, and direct bank transfer. After sending payment, upload a screenshot and transaction ID in-app. Subscriptions are activated manually within 24 hours.",
  },
  {
    question: "Can I get a refund?",
    answer:
      "Refunds are not available once a subscription has been activated. If you have an issue before activation, reach out and we will resolve it before proceeding.",
  },
];

interface FAQItemProps {
  faq: (typeof faqs)[number];
  index: number;
}

function FAQItem({ faq, index }: FAQItemProps): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="border-b border-line-subtle last:border-0"
    >
      <button
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-sm md:text-base font-medium text-text-primary">{faq.question}</span>
        <ChevronDown
          size={16}
          className={`text-text-muted shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <p className="text-sm md:text-base text-text-secondary leading-relaxed pb-4">{faq.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQSection(): React.ReactElement {
  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20">
      <motion.div
        className="mb-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-xs md:text-sm uppercase tracking-widest text-text-muted font-medium mb-3">FAQ</p>
        <h2 className="text-2xl md:text-3xl lg:text-5xl font-medium text-text-primary leading-tight">
          Common questions.
        </h2>
      </motion.div>

      <div>
        {faqs.map((faq, i) => (
          <FAQItem key={faq.question} faq={faq} index={i} />
        ))}
      </div>
    </section>
  );
}
