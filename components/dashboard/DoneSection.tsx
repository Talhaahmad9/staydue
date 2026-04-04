"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DeadlineCard from "@/components/dashboard/DeadlineCard";

interface DashboardDeadline {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: string;
  status: "upcoming" | "done" | "overdue";
}

interface DoneSectionProps {
  doneDeadlines: DashboardDeadline[];
  onUndo: (id: string) => Promise<void>;
}

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

export default function DoneSection({
  doneDeadlines,
  onUndo,
}: DoneSectionProps): React.ReactElement | null {
  const [isExpanded, setIsExpanded] = useState(false);

  if (doneDeadlines.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-line/50">
      <div className="flex items-center gap-3 mb-3">
        <p className="text-xs uppercase tracking-widest font-medium text-text-muted">Done</p>
        <span className="bg-urgency-done border border-urgency-doneBorder text-urgency-doneText text-xs font-medium px-2 py-0.5 rounded-full">
          {doneDeadlines.length}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-auto text-text-muted hover:text-text-primary transition-colors"
          aria-label={isExpanded ? "Collapse done" : "Expand done"}
        >
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <motion.ul
              className="mt-3 space-y-3"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="popLayout">
                {doneDeadlines.map((deadline) => (
                  <motion.li key={deadline.id} variants={itemVariants} layout>
                    <DeadlineCard
                      id={deadline.id}
                      title={deadline.title}
                      courseCode={deadline.courseCode}
                      courseTitle={deadline.courseTitle}
                      dueDate={new Date(deadline.dueDate)}
                      status="done"
                      isDone={true}
                      onUndo={onUndo}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
