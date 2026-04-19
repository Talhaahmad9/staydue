interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: "default" | "brand" | "warning" | "danger" | "success";
}

const accentMap = {
  default: "text-text-primary",
  brand: "text-brand",
  warning: "text-amber-400",
  danger: "text-red-400",
  success: "text-green-400",
};

export default function StatCard({ label, value, sub, accent = "default" }: StatCardProps) {
  return (
    <div className="bg-page-surface border border-line rounded-xl p-4 flex flex-col gap-1">
      <p className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-2xl font-semibold ${accentMap[accent]}`}>{value}</p>
      {sub && <p className="text-xs text-text-muted">{sub}</p>}
    </div>
  );
}
