import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <main className="min-h-screen bg-page-bg flex flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-sm font-medium text-text-muted">Page not found</p>
      <h1 className="mb-3 text-2xl font-medium text-text-primary">This page doesn&apos;t exist</h1>
      <p className="mb-8 max-w-sm text-text-secondary">
        The link you followed may be broken or the page may have been removed.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-medium text-white transition-colors"
      >
        Back to home
      </Link>
    </main>
  );
}
