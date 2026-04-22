export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-5 animate-pulse">
      {/* Page header */}
      <div className="h-6 w-32 bg-page-surface rounded" />

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-page-surface rounded-xl" />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-64 bg-page-surface rounded-xl" />
        <div className="h-64 bg-page-surface rounded-xl" />
      </div>
    </div>
  );
}
