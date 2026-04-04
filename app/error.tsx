"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): React.ReactElement {
  useEffect(() => {
    console.error("[app/error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-page-bg flex flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-sm font-medium text-urgency-todayText">Something went wrong</p>
      <h1 className="mb-3 text-2xl font-medium text-text-primary">We ran into a problem</h1>
      <p className="mb-8 max-w-sm text-text-secondary">
        This wasn&apos;t supposed to happen. Please try again — if the issue continues, reach out to us.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-brand hover:bg-brand-hover px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-line hover:border-line-strong hover:bg-page-hover px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
