"use client";

import { useMemo, useState } from "react";

import CourseFilter from "@/components/dashboard/CourseFilter";
import DeadlineCard from "@/components/dashboard/DeadlineCard";
import EmptyState from "@/components/dashboard/EmptyState";

interface DashboardDeadline {
  id: string;
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: string;
}

interface CourseOption {
  value: string;
  label: string;
}

interface DeadlineListProps {
  deadlines: DashboardDeadline[];
}

export default function DeadlineList({ deadlines }: DeadlineListProps): React.ReactElement {
  const [selectedCourse, setSelectedCourse] = useState("all");

  const courses = useMemo<CourseOption[]>(() => {
    const courseMap = new Map<string, string>();

    for (const deadline of deadlines) {
      if (!courseMap.has(deadline.courseCode)) {
        courseMap.set(deadline.courseCode, `${deadline.courseCode} - ${deadline.courseTitle}`);
      }
    }

    return Array.from(courseMap.entries())
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([value, label]) => ({ value, label }));
  }, [deadlines]);

  const filteredDeadlines = useMemo(() => {
    if (selectedCourse === "all") {
      return deadlines;
    }

    return deadlines.filter((deadline) => deadline.courseCode === selectedCourse);
  }, [deadlines, selectedCourse]);

  if (deadlines.length === 0) {
    return (
      <EmptyState
        title="No deadlines yet"
        description="Connect your Moodle calendar from onboarding to import assignments."
      />
    );
  }

  return (
    <div className="space-y-5">
      <CourseFilter
        courses={courses}
        selectedCourse={selectedCourse}
        onChange={setSelectedCourse}
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredDeadlines.map((deadline) => (
          <DeadlineCard
            key={deadline.id}
            title={deadline.title}
            courseCode={deadline.courseCode}
            courseTitle={deadline.courseTitle}
            dueDate={new Date(deadline.dueDate)}
          />
        ))}
      </div>
    </div>
  );
}
