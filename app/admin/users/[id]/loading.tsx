export default function Loading() {
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl animate-pulse">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-page-surface rounded-lg shrink-0" />
        <div className="space-y-1.5">
          <div className="h-5 w-40 bg-page-surface rounded" />
          <div className="h-3.5 w-52 bg-page-surface rounded" />
        </div>
      </div>

      {/* Profile section */}
      <div className="h-40 bg-page-surface rounded-xl" />

      {/* Deadlines section */}
      <div className="h-28 bg-page-surface rounded-xl" />

      {/* Pro control */}
      <div className="h-24 bg-page-surface rounded-xl" />

      {/* Access dates */}
      <div className="h-20 bg-page-surface rounded-xl" />

      {/* Subscription history */}
      <div className="space-y-2">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="h-14 bg-page-surface rounded-xl" />
        ))}
      </div>
    </div>
  );
}
