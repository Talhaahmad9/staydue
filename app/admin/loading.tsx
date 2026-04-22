export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-6 animate-pulse">
      {/* Pending alert skeleton */}
      <div className="h-10 bg-page-surface rounded-xl" />

      {/* Users stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-page-surface rounded-xl" />
        ))}
      </div>

      {/* Revenue stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[...Array(3)].map((_, i) => (
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
