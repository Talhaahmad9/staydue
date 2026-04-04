export default function SkeletonCard(): React.ReactElement {
  return (
    <div className="bg-page-card border border-line/50 rounded-xl p-4 animate-pulse">
      <div className="h-3 bg-line rounded w-3/4 mb-3" />
      <div className="h-2.5 bg-line rounded w-1/2 mb-2" />
      <div className="h-2.5 bg-line rounded w-1/3" />
    </div>
  );
}
