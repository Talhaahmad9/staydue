"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import CourseFilter from "@/components/dashboard/CourseFilter";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import EmptyState from "@/components/dashboard/EmptyState";
import OverdueSection from "@/components/dashboard/OverdueSection";
import DoneSection from "@/components/dashboard/DoneSection";
import SkeletonCard from "@/components/shared/loaders/SkeletonCard";
import { getDeadlineUrgency } from "@/utils/date";

interface DashboardDeadline {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: string;
  status: "upcoming" | "done" | "overdue";
}

interface CourseOption {
  value: string;
  label: string;
}

interface DeadlineListProps {
  deadlines: DashboardDeadline[];
  overdueDeadlines?: DashboardDeadline[];
  doneDeadlines?: DashboardDeadline[];
  isLoading?: boolean;
}

const containerVariants = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  exit: { opacity: 0, height: 0, transition: { duration: 0.2 } },
};

function StatCard({ label, value, color }: { label: string; value: number; color?: string }): React.ReactElement {
  return (
    <div className="bg-page-card border border-line/50 rounded-xl p-4">
      <p className="text-xs text-text-muted uppercase tracking-widest font-medium">{label}</p>
      <p className={`text-2xl font-medium mt-2 ${color ?? "text-text-primary"}`}>{value}</p>
    </div>
  );
}

export default function DeadlineList({
  deadlines,
  overdueDeadlines = [],
  doneDeadlines = [],
  isLoading,
}: DeadlineListProps): React.ReactElement {
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [localDeadlines, setLocalDeadlines] = useState(deadlines);
  const [localDone, setLocalDone] = useState(doneDeadlines);

  // Sync local state with props whenever props change (after router.refresh())
  useEffect(() => {
    setLocalDeadlines(deadlines);
  }, [deadlines]);

  useEffect(() => {
    setLocalDone(doneDeadlines);
  }, [doneDeadlines]);

  const courses = useMemo<CourseOption[]>(() => {
    const courseMap = new Map<string, string>();

    for (const deadline of localDeadlines) {
      if (!courseMap.has(deadline.courseCode)) {
        courseMap.set(deadline.courseCode, `${deadline.courseCode} - ${deadline.courseTitle}`);
      }
    }

    return Array.from(courseMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([value, label]) => ({ value, label }));
  }, [localDeadlines]);

  const filteredDeadlines = useMemo(() => {
    if (selectedCourse === "all") {
      return localDeadlines;
    }

    return localDeadlines.filter((deadline) => deadline.courseCode === selectedCourse);
  }, [localDeadlines, selectedCourse]);

  // Calculate stats using timezone-aware urgency logic
  const todayDeadlines = useMemo(
    () => localDeadlines.filter((d) => getDeadlineUrgency(new Date(d.dueDate)) === "today"),
    [localDeadlines]
  );

  const tomorrowDeadlines = useMemo(
    () => localDeadlines.filter((d) => getDeadlineUrgency(new Date(d.dueDate)) === "tomorrow"),
    [localDeadlines]
  );

  const totalDeadlines = localDeadlines.length;

  const handleMarkDone = useCallback(
    async (id: string) => {
      // Optimistically remove from list
      setLocalDeadlines((prev) => prev.filter((d) => d.id !== id));

      try {
        const response = await fetch(`/api/deadlines/${id}/done`, { method: "POST" });
        if (!response.ok) {
          throw new Error("Failed to mark as done");
        }
        // Sync server state after successful API call
        router.refresh();
      } catch {
        // Revert optimistic update
        setLocalDeadlines((prev) => {
          const deadline = deadlines.find((d) => d.id === id);
          if (!deadline) return prev;
          return [...prev, deadline].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        });
      }
    },
    [deadlines, router]
  );

  const handleUndo = useCallback(
    async (id: string) => {
      // Optimistically remove from done list
      setLocalDone((prev) => prev.filter((d) => d.id !== id));

      try {
        const response = await fetch(`/api/deadlines/${id}/undone`, { method: "POST" });
        if (!response.ok) {
          throw new Error("Failed to undo mark as done");
        }
        // Sync server state after successful API call
        router.refresh();
      } catch {
        // Revert optimistic update
        setLocalDone((prev) => {
          const deadline = doneDeadlines.find((d) => d.id === id);
          if (!deadline) return prev;
          return [...prev, deadline];
        });
      }
    },
    [doneDeadlines, router]
  );

  if (localDeadlines.length === 0 && overdueDeadlines.length === 0 && localDone.length === 0 && !isLoading) {
    return (
      <EmptyState
        title="No deadlines found"
        description="Your Moodle calendar has been connected. New assignments will appear here automatically."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total this week" value={totalDeadlines} />
        <StatCard
          label="Due today"
          value={todayDeadlines.length}
          color={todayDeadlines.length > 0 ? "text-urgency-todayText" : "text-text-primary"}
        />
        <StatCard
          label="Due tomorrow"
          value={tomorrowDeadlines.length}
          color={tomorrowDeadlines.length > 0 ? "text-urgency-tomorrowText" : "text-text-primary"}
        />
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : (
        <>
          {/* Course filter tabs */}
          {filteredDeadlines.length > 0 && (
            <CourseFilter
              courses={courses}
              selectedCourse={selectedCourse}
              onChange={setSelectedCourse}
            />
          )}

          {/* Deadline cards list */}
          {filteredDeadlines.length > 0 ? (
            <motion.ul
              className="space-y-3"
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              <AnimatePresence mode="popLayout">
                {filteredDeadlines.map((deadline) => (
                  <motion.li key={deadline.id} variants={itemVariants} layout>
                    <DeadlineCard
                      id={deadline.id}
                      title={deadline.title}
                      courseCode={deadline.courseCode}
                      courseTitle={deadline.courseTitle}
                      dueDate={new Date(deadline.dueDate)}
                      status={deadline.status}
                      onDoneClick={handleMarkDone}
                    />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
          ) : (
            <EmptyState
              title="No deadlines for this filter"
              description="Try selecting a different course or clearing your filter."
            />
          )}

          {/* Overdue section */}
          {overdueDeadlines.length > 0 && (
            <OverdueSection overdueDeadlines={overdueDeadlines} onDone={handleMarkDone} />
          )}

          {/* Done section */}
          {localDone.length > 0 && (
            <DoneSection doneDeadlines={localDone} onUndo={handleUndo} />
          )}
        </>
      )}
    </div>
  );
}
