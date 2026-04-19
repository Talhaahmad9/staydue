"use client";

import { useRouter, useSearchParams } from "next/navigation";

const TIER_TABS = [
  { value: "", label: "All" },
  { value: "pro", label: "Pro" },
  { value: "trial", label: "Trial" },
  { value: "free", label: "Free" },
];

const ONBOARDED_TABS = [
  { value: "", label: "Any" },
  { value: "yes", label: "Onboarded" },
  { value: "no", label: "Not onboarded" },
];

export default function UserFilterBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tier = searchParams.get("tier") ?? "";
  const onboarded = searchParams.get("onboarded") ?? "";

  function applyFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/admin/users?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-3">
      <div className="flex flex-wrap gap-1.5">
        {TIER_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => applyFilter("tier", t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              tier === t.value
                ? "bg-brand text-white"
                : "bg-page-surface border border-line text-text-secondary hover:text-text-primary hover:bg-page-hover"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ONBOARDED_TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => applyFilter("onboarded", t.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              onboarded === t.value
                ? "bg-brand text-white"
                : "bg-page-surface border border-line text-text-secondary hover:text-text-primary hover:bg-page-hover"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
