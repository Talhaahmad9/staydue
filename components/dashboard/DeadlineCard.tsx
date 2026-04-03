import { formatDashboardDueDate, getDeadlineUrgency } from "@/utils/date";

interface DeadlineCardProps {
  title: string;
  courseCode: string;
  courseTitle: string;
  dueDate: Date;
}

const urgencyClassMap: Record<string, string> = {
  today: "bg-red-50 border-red-200 text-red-700",
  tomorrow: "bg-amber-50 border-amber-200 text-amber-700",
  upcoming: "bg-teal-50 border-teal-200 text-teal-700",
};

export default function DeadlineCard({
  title,
  courseCode,
  courseTitle,
  dueDate,
}: DeadlineCardProps): React.ReactElement {
  const urgency = getDeadlineUrgency(dueDate);
  const formattedDueDate = formatDashboardDueDate(dueDate);

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        <span
          className={`rounded-full border px-2 py-1 text-xs font-medium ${urgencyClassMap[urgency]}`}
        >
          {urgency}
        </span>
      </div>
      <p className="text-sm font-medium text-gray-700">{courseCode}</p>
      <p className="text-sm text-gray-500">{courseTitle}</p>
      <p className="mt-2 text-sm text-gray-500">Due {formattedDueDate}</p>
    </article>
  );
}
