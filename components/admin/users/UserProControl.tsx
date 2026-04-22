"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { grantPro, revokePro, revokeTrial } from "@/app/admin/users/actions";
import { useConfirmation } from "@/contexts/ConfirmationModalContext";

interface Props {
  userId: string;
  isPro: boolean;
  hasTrial: boolean;
}

export default function UserProControl({ userId, isPro, hasTrial }: Props) {
  const [plan, setPlan] = useState<"monthly" | "semester">("monthly");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { openConfirmation } = useConfirmation();

  function handleGrant() {
    setError(null);
    startTransition(async () => {
      const result = await grantPro(userId, plan);
      if (!result.success) setError(result.error ?? "Failed");
    });
  }

  function handleRevoke() {
    setError(null);
    openConfirmation({
      title: "Revoke Pro access",
      description: "This will immediately remove Pro access and expire any active subscriptions for this user.",
      confirmLabel: "Revoke Pro",
      variant: "destructive",
      onConfirm: async () => {
        const result = await revokePro(userId);
        if (!result.success) setError(result.error ?? "Failed to revoke Pro");
      },
    });
  }

  function handleRevokeTrial() {
    setError(null);
    openConfirmation({
      title: "Revoke trial access",
      description: "This will reset the user's trial data. They will be able to start a new trial with the same phone number.",
      confirmLabel: "Revoke trial",
      variant: "destructive",
      onConfirm: async () => {
        const result = await revokeTrial(userId);
        if (!result.success) setError(result.error ?? "Failed to revoke trial");
      },
    });
  }

  return (
    <div className="bg-page-surface border border-line rounded-xl p-4 space-y-3">
      <p className="text-sm font-medium text-text-primary">Pro access</p>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {isPro ? (
        <button
          onClick={handleRevoke}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium rounded-lg transition-colors"
        >
          Revoke Pro
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <select
            value={plan}
            onChange={(e) => setPlan(e.target.value as "monthly" | "semester")}
            className="bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-brand"
          >
            <option value="monthly">Monthly (+1 month)</option>
            <option value="semester">Semester (+4 months)</option>
          </select>
          <button
            onClick={handleGrant}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            Grant Pro
          </button>
        </div>
      )}

      {hasTrial && !isPro && (
        <div className="border-t border-line pt-3 space-y-2">
          <p className="text-sm font-medium text-text-primary">Trial access</p>
          <button
            onClick={handleRevokeTrial}
            className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 text-sm font-medium rounded-lg transition-colors"
          >
            Revoke trial
          </button>
        </div>
      )}
    </div>
  );
}
