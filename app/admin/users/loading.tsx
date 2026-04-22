export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-4 animate-pulse">
      {/* Search bar */}
      <div className="h-9 bg-page-surface rounded-lg" />

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-page-surface rounded-full" />
        ))}
      </div>

      {/* Table header */}
      <div className="h-10 bg-page-surface rounded-xl" />

      {/* Table rows */}
      <div className="space-y-1">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-12 bg-page-surface rounded-xl" />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex gap-2">
        <div className="h-8 w-16 bg-page-surface rounded-lg" />
        <div className="h-8 w-16 bg-page-surface rounded-lg" />
      </div>
    </div>
  );
}
