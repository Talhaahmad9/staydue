import Link from "next/link";

export default function NotFound(): React.ReactElement {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-sm font-medium text-teal-700">Page not found</p>
      <h1 className="mb-3 text-3xl font-medium text-gray-900">This page does not exist</h1>
      <p className="mb-8 max-w-sm text-gray-500">
        The link may be broken or the page may have been moved.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-teal-700"
      >
        Back to home
      </Link>
    </main>
  );
}
