import Spinner from "@/components/shared/loaders/Spinner";

export default function PageLoader(): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-page-bg gap-4">
      <Spinner size="lg" />
      <p className="text-sm text-text-muted">Loading</p>
    </div>
  );
}
