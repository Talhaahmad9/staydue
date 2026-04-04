"use client";

import { motion } from "framer-motion";
import { formatDashboardDueDate, getDeadlineUrgency } from "@/utils/date";
import DeadlineCardActions from "@/components/dashboard/DeadlineCardActions";

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
  isOverdue = false,
  isDone = false,
  onDoneClick,
  onUndo,
}: DeadlineCardProps): React.ReactElement {
  const urgency = isDone ? "done" : isOverdue ? "overdue" : getDeadlineUrgency(dueDate);
  const config = isDone
    ? doneConfig
    : isOverdue
      ? overdueConfig
      : urgencyConfig[urgency as keyof typeof urgencyConfig] || urgencyConfig.upcoming;
  const formattedDueDate = formatDashboardDueDate(dueDate);

  return (
    <motion.article
      className={`${config.bg} ${config.border} ${config.borderLeft} border border-l-4 rounded-xl p-4 transition-colors flex flex-col ${isDone ? "opacity-60" : ""}`}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-sm font-medium text-text-primary flex-1 line-clamp-2">
          {title}
        </h3>
        <span
          className={`${config.badge} rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap`}
        >
          {isDone ? doneConfig.label : isOverdue ? overdueConfig.label : config.label}
        </span>
      </div>

      <div className="space-y-1 flex-1">
        <p className="text-xs font-medium text-text-muted">{courseCode}</p>
        <p className="text-xs text-text-secondary">{courseTitle}</p>
        <p className="text-xs text-text-muted">Due {formattedDueDate}</p>
      </div>

      <DeadlineCardActions
        id={id}
        isDone={isDone}
        isOverdue={isOverdue}
        onDoneClick={onDoneClick}
        onUndo={onUndo}
      />
    </motion.article>
  );
}
