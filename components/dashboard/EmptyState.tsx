"use client";

import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface EmptyStateProps {
  title: string;
  description: string;
}

export default function EmptyState({ title, description }: EmptyStateProps): React.ReactElement {
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh(): Promise<void> {
    setRefreshing(true);
    try {
      const response = await fetch("/api/calendar", { method: "POST" });
      if (!response.ok) {
        throw new Error("Failed to refresh calendar");
      }
      window.location.reload();
    } catch {
      setRefreshing(false);
    }
  }

  return (
    <section className="rounded-xl border border-line/50 bg-page-card px-6 py-12 text-center">
      <h2 className="text-lg font-medium text-text-primary">{title}</h2>
      <p className="mt-2 text-sm text-text-secondary">{description}</p>
      <button
        onClick={handleRefresh}
        disabled={refreshing}
        className="mt-6 flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {refreshing ? <ButtonLoader /> : "Refresh"}
      </button>
    </section>
  );
}
