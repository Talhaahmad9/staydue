"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { toggleDiscountCode } from "@/app/admin/discounts/actions";
import type { AdminDiscount } from "@/lib/admin";

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function DiscountCodeList({ codes }: { codes: AdminDiscount[] }) {
  if (codes.length === 0) {
    return (
      <div className="text-center py-12 bg-page-surface border border-line rounded-xl">
        <p className="text-text-secondary text-sm">No discount codes yet</p>
      </div>
    );
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_1fr_80px] gap-3 px-4 py-2.5 bg-page-surface border-b border-line">
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Code</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Description</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Discount</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Plans</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Uses</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Valid until</p>
        <p className="text-xs text-text-muted font-medium uppercase tracking-wider">Active</p>
      </div>

      <div className="divide-y divide-line">
        {codes.map((code) => (
          <DiscountCodeRow key={code.id} code={code} />
        ))}
      </div>
    </div>
  );
}

function DiscountCodeRow({ code }: { code: AdminDiscount }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleDiscountCode(code.id, !code.isActive);
      if (!result.success) setError(result.error ?? "Failed");
    });
  }

  return (
    <div className="px-4 py-3 bg-page-bg hover:bg-page-surface transition-colors">
      {/* Desktop layout */}
      <div className="hidden sm:grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr_1fr_80px] gap-3 items-center">
        <p className="text-sm font-mono font-medium text-text-primary">{code.code}</p>
        <p className="text-sm text-text-secondary truncate">{code.description}</p>
        <p className="text-sm text-text-primary">{code.discountValue} PKR off</p>
        <p className="text-xs text-text-secondary capitalize">{code.applicablePlans.join(", ")}</p>
        <p className="text-sm text-text-secondary">
          {code.usedCount}{code.maxUses ? ` / ${code.maxUses}` : ""}
        </p>
        <p className="text-sm text-text-secondary">{formatDate(code.validUntil)}</p>
        <ToggleButton isActive={code.isActive} isPending={isPending} onToggle={handleToggle} />
      </div>

      {/* Mobile layout */}
      <div className="sm:hidden flex items-start justify-between gap-3">
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-mono font-medium text-text-primary">{code.code}</p>
          <p className="text-xs text-text-secondary truncate">{code.description}</p>
          <p className="text-xs text-text-muted">
            {code.discountValue} PKR off · {code.applicablePlans.join(", ")} ·{" "}
            {code.usedCount}{code.maxUses ? `/${code.maxUses}` : ""} uses
          </p>
        </div>
        <ToggleButton isActive={code.isActive} isPending={isPending} onToggle={handleToggle} />
      </div>

      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

function ToggleButton({
  isActive,
  isPending,
  onToggle,
}: {
  isActive: boolean;
  isPending: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      disabled={isPending}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
        isActive ? "bg-brand" : "bg-line-strong"
      }`}
      aria-label={isActive ? "Deactivate" : "Activate"}
    >
      {isPending ? (
        <Loader2 className="w-3 h-3 text-white mx-auto animate-spin" />
      ) : (
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
            isActive ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      )}
    </button>
  );
}
