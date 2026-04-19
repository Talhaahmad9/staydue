"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TABS = [
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

export default function SubscriptionFilterTabs({
  pendingCount,
}: {
  pendingCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "pending";

  function handleTab(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("status", value);
    params.delete("page");
    router.push(`/admin/subscriptions?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => handleTab(value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            current === value
              ? "bg-brand text-white"
              : "bg-page-surface border border-line text-text-secondary hover:text-text-primary hover:bg-page-hover"
          }`}
        >
          {label}
          {value === "pending" && pendingCount > 0 && (
            <span
              className={`text-xs rounded-full min-w-4 h-4 flex items-center justify-center px-1 ${
                current === "pending" ? "bg-white/20 text-white" : "bg-red-500 text-white"
              }`}
            >
              {pendingCount}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
