export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-4 animate-pulse">
      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-9 w-24 bg-page-surface rounded-lg" />
        ))}
      </div>

      {/* Subscription rows */}
      <div className="space-y-2">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-14 bg-page-surface rounded-xl" />
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
