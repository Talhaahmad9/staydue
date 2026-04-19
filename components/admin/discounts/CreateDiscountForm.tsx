"use client";

import { useState, useTransition } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import { createDiscountCode } from "@/app/admin/discounts/actions";

const EMPTY = {
  code: "",
  description: "",
  discountValue: "",
  plans: { monthly: true, semester: true },
  maxUses: "",
  validFrom: "",
  validUntil: "",
};

export default function CreateDiscountForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const applicablePlans: ("monthly" | "semester")[] = [];
    if (form.plans.monthly) applicablePlans.push("monthly");
    if (form.plans.semester) applicablePlans.push("semester");

    startTransition(async () => {
      const result = await createDiscountCode({
        code: form.code.toUpperCase().trim(),
        description: form.description.trim(),
        discountValue: parseInt(form.discountValue, 10),
        applicablePlans,
        maxUses: form.maxUses ? parseInt(form.maxUses, 10) : null,
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
      });

      if (result.success) {
        setForm(EMPTY);
        setOpen(false);
      } else {
        setError(result.error ?? "Failed to create");
      }
    });
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        New code
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-page-surface border border-brand/30 rounded-xl p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">New discount code</p>
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Code *</label>
          <input
            required
            type="text"
            value={form.code}
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
            placeholder="LAUNCH50"
            maxLength={32}
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Discount (PKR off) *</label>
          <input
            required
            type="number"
            min={1}
            max={10000}
            value={form.discountValue}
            onChange={(e) => setForm((f) => ({ ...f, discountValue: e.target.value }))}
            placeholder="100"
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-text-muted block mb-1">Description *</label>
          <input
            required
            type="text"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Launch week discount"
            maxLength={120}
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Max uses (blank = unlimited)</label>
          <input
            type="number"
            min={1}
            value={form.maxUses}
            onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
            placeholder="50"
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Valid until (blank = forever)</label>
          <input
            type="date"
            value={form.validUntil}
            onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-text-muted block mb-2">Applicable plans *</label>
          <div className="flex gap-4">
            {(["monthly", "semester"] as const).map((plan) => (
              <label key={plan} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.plans[plan]}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, plans: { ...f.plans, [plan]: e.target.checked } }))
                  }
                  className="w-4 h-4 accent-brand"
                />
                <span className="text-sm text-text-secondary capitalize">{plan}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-1">
        <button
          type="button"
          onClick={() => { setOpen(false); setError(null); }}
          className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Create code
        </button>
      </div>
    </form>
  );
}
