export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-5 animate-pulse">
      {/* Page header */}
      <div className="h-6 w-32 bg-page-surface rounded" />

      {/* Alert banners */}
      <div className="space-y-2">
        <div className="h-10 bg-page-surface rounded-xl" />
        <div className="h-10 bg-page-surface rounded-xl" />
      </div>

      {/* User integrity stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-page-surface rounded-xl" />
        ))}
      </div>

      {/* Deadline stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-page-surface rounded-xl" />
        ))}
      </div>

      {/* Cron log table */}
      <div className="h-8 w-40 bg-page-surface rounded" />
      <div className="space-y-1">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-10 bg-page-surface rounded-xl" />
        ))}
      </div>
    </div>
  );
}
