export default function SkeletonCard(): React.ReactElement {
  return (
    <div className="animate-pulse rounded-xl border border-gray-100 p-4">
      <div className="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      <div className="mb-2 h-3 w-1/2 rounded bg-gray-200" />
      <div className="h-3 w-1/4 rounded bg-gray-200" />
    </div>
  );
}
