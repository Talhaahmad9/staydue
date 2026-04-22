export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-5 animate-pulse">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="h-6 w-40 bg-page-surface rounded" />
          <div className="h-3.5 w-28 bg-page-surface rounded" />
        </div>
        <div className="h-9 w-28 bg-page-surface rounded-lg" />
      </div>

      {/* Table header row */}
      <div className="h-10 bg-page-surface rounded-xl" />

      {/* Table rows */}
      <div className="space-y-px">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 bg-page-surface rounded-xl" />
        ))}
      </div>
    </div>
  );
}
