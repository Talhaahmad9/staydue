"use client";

interface CourseFilterProps {
  courses: { value: string; label: string }[];
  selectedCourse: string;
  onChange: (course: string) => void;
}

export default function CourseFilter({
  courses,
  selectedCourse,
  onChange,
}: CourseFilterProps): React.ReactElement {
  const allCourses = [
    { value: "all", label: "All" },
    ...courses,
  ];

  return (
    <>
      {/* Mobile dropdown (visible below sm breakpoint) */}
      <div className="sm:hidden px-4 pb-2">
        <select
          value={selectedCourse}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 rounded-full border border-line/50 bg-page-card text-text-muted text-xs font-medium transition-colors appearance-none cursor-pointer hover:border-line-strong focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand"
        >
          {allCourses.map((course) => (
            <option key={course.value} value={course.value}>
              {course.label}
            </option>
          ))}
        </select>
      </div>

      {/* Desktop/tablet tabs (visible at sm breakpoint and above) */}
      <div className="hidden sm:flex overflow-x-auto gap-2 -mx-4 sm:-mx-6 px-4 sm:px-6 pb-2">
        {allCourses.map((course) => (
          <button
            key={course.value}
            onClick={() => onChange(course.value)}
            className={`whitespace-nowrap px-4 py-2 rounded-full border text-xs font-medium transition-colors ${
              selectedCourse === course.value
                ? "bg-brand-light border-brand/40 text-brand"
                : "bg-page-card border-line/50 text-text-muted hover:border-line-strong"
            }`}
          >
            {course.label}
          </button>
        ))}
      </div>
    </>
  );
}
