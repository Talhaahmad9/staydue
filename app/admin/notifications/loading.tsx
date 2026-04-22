export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-5 animate-pulse">
      {/* Page header */}
      <div className="h-6 w-44 bg-page-surface rounded" />

      {/* Send totals */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-page-surface rounded-xl" />
        ))}
      </div>

      {/* Channel breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-page-surface rounded-xl" />
        ))}
      </div>

      {/* Chart */}
      <div className="h-56 bg-page-surface rounded-xl" />
    </div>
  );
}
