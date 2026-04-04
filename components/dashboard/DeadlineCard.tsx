"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { formatDashboardDueDate, getDeadlineUrgency } from "@/utils/date";
import Spinner from "@/components/shared/loaders/Spinner";

interface DeadlineCardProps {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: Date;
  status: "upcoming" | "done" | "overdue";
  isOverdue?: boolean;
  isDone?: boolean;
  onDoneClick?: (id: string) => Promise<void>;
  onUndo?: (id: string) => Promise<void>;
}

const urgencyConfig = {
  today: {
    bg: "bg-urgency-today",
    border: "border-urgency-todayBorder",
    borderLeft: "border-l-urgency-todayText",
    badge: "bg-urgency-today border-urgency-todayBorder text-urgency-todayText",
    label: "Due today",
  },
  tomorrow: {
    bg: "bg-urgency-tomorrow",
    border: "border-urgency-tomorrowBorder",
    borderLeft: "border-l-urgency-tomorrowText",
    badge: "bg-urgency-tomorrow border-urgency-tomorrowBorder text-urgency-tomorrowText",
    label: "Due tomorrow",
  },
  upcoming: {
    bg: "bg-page-card",
    border: "border-line/50",
    borderLeft: "border-l-text-muted",
    badge: "bg-page-surface border-line text-text-muted",
    label: "Upcoming",
  },
};

const overdueConfig = {
  bg: "bg-urgency-today",
  border: "border-urgency-todayBorder",
  borderLeft: "border-l-urgency-todayText",
  badge: "bg-urgency-today border-urgency-todayBorder text-urgency-todayText",
  label: "Overdue",
};

const doneConfig = {
  bg: "bg-urgency-done",
  border: "border-urgency-doneBorder",
  borderLeft: "border-l-urgency-doneText",
  badge: "bg-urgency-done border-urgency-doneBorder text-urgency-doneText",
  label: "Done",
};

export default function DeadlineCard({
  id,
  title,
  courseCode,
  courseTitle,
  dueDate,
  status,
  isOverdue = false,
  isDone = false,
  onDoneClick,
  onUndo,
}: DeadlineCardProps): React.ReactElement {
  const [marking, setMarking] = useState(false);

  const urgency = isDone ? "done" : isOverdue ? "overdue" : getDeadlineUrgency(dueDate);
  const config = isDone ? doneConfig : isOverdue ? overdueConfig : urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.upcoming;
  const formattedDueDate = formatDashboardDueDate(dueDate);

  async function handleMarkDone(): Promise<void> {
    if (!onDoneClick || marking) return;
    setMarking(true);
    try {
      await onDoneClick(id);
    } finally {
      setMarking(false);
    }
  }

  async function handleUndo(): Promise<void> {
    if (!onUndo || marking) return;
    setMarking(true);
    try {
      await onUndo(id);
    } finally {
      setMarking(false);
    }
  }

  return (
    <motion.article
      className={`${config.bg} ${config.border} ${config.borderLeft} border border-l-4 rounded-xl p-4 transition-colors relative ${isDone ? "opacity-60" : ""}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-text-primary flex-1 line-clamp-2">{title}</h3>
        <span className={`${config.badge} rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap`}>
          {isDone ? doneConfig.label : isOverdue ? overdueConfig.label : config.label}
        </span>
      </div>

      <div className="space-y-1">
        <p className="text-xs font-medium text-text-muted">{courseCode}</p>
        <p className="text-xs text-text-secondary">{courseTitle}</p>
        <p className="text-xs text-text-muted">Due {formattedDueDate}</p>
      </div>

      {/* Done button - only show for active deadlines, not overdue or done */}
      {!isOverdue && !isDone && status !== "done" && (
        <button
          onClick={handleMarkDone}
          disabled={marking}
          className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-page-surface border border-line hover:border-urgency-doneBorder hover:bg-urgency-done transition-colors flex items-center justify-center disabled:opacity-50"
          aria-label="Mark as done"
        >
          {marking ? (
            <Spinner size="sm" />
          ) : (
            <svg
              className="w-3.5 h-3.5 text-urgency-doneText"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>
      )}

      {/* Undo button - only show for done deadlines */}
      {isDone && (
        <button
          onClick={handleUndo}
          disabled={marking}
          className="absolute bottom-4 right-4 w-7 h-7 rounded-full bg-page-surface border border-line hover:border-line-strong transition-colors flex items-center justify-center disabled:opacity-50"
          aria-label="Undo"
        >
          {marking ? (
            <Spinner size="sm" />
          ) : (
            <svg
              className="w-3.5 h-3.5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 1.105 1.343 2 3 2h4m0 0h4c1.657 0 3-.895 3-2v-10m-7 5l-3 3m0 0l3 3m-3-3h12" />
            </svg>
          )}
        </button>
      )}
    </motion.article>
  );
}
