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
  return (
    <div className="w-full max-w-xs">
      <label htmlFor="course-filter" className="mb-2 block text-sm font-medium text-gray-700">
        Filter by course
      </label>
      <select
        id="course-filter"
        value={selectedCourse}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm outline-none focus:border-teal-600"
      >
        <option value="all">All courses</option>
        {courses.map((course) => (
          <option key={course.value} value={course.value}>
            {course.label}
          </option>
        ))}
      </select>
    </div>
  );
}
