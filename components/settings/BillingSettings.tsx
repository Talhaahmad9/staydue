"use client";

import { useEffect, useState } from "react";
import SettingsSection from "./SettingsLayout";
import BillingUpgradeForm from "./BillingUpgradeForm";
import Spinner from "@/components/shared/loaders/Spinner";

interface StatusResponse {
  isPro: boolean;
  proDaysLeft: number | null;
  trialDaysLeft: number | null;
  hasPhone: boolean;
  subscription: {
    status: "pending" | "active" | "expired" | "rejected";
    plan: "monthly" | "semester";
    endDate: string | null;
  } | null;
}

interface BillingSettingsProps {
  refreshKey?: number;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function BillingSettings({ refreshKey = 0 }: BillingSettingsProps): React.ReactElement {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "semester">("monthly");

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json() as Promise<StatusResponse>;
      })
      .then((data) => setStatus(data))
      .catch((error) => console.error("[billing/status]", error))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <SettingsSection title="Billing" description="Manage your subscription">
        <div className="h-24 flex items-center justify-center">
          <Spinner size="sm" />
        </div>
      </SettingsSection>
    );
  }

  return (
    <SettingsSection title="Billing" description="Manage your subscription">
      {status?.isPro ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Pro plan</p>
              <p className="text-xs text-text-muted mt-0.5">{status.proDaysLeft} days remaining</p>
            </div>
            <span className="bg-brand-light border border-brand/40 text-brand text-xs font-medium px-2.5 py-0.5 rounded-full">
              Active
            </span>
          </div>
          <p className="text-xs text-text-muted">
            Your plan renews or expires on {formatDate(status.subscription?.endDate ?? null)}.
            To extend, submit a new payment after expiry.
          </p>
        </div>
      ) : status?.subscription?.status === "pending" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">Payment under review</p>
            <span className="bg-urgency-tomorrow border border-urgency-tomorrowBorder text-urgency-tomorrowText text-xs font-medium px-2.5 py-0.5 rounded-full">
              Pending
            </span>
          </div>
          <p className="text-xs text-text-muted">
            We received your payment screenshot and are reviewing it.
            You will receive an email once approved — usually within a few hours.
          </p>
        </div>
      ) : status?.subscription?.status === "rejected" ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-text-primary">Payment not approved</p>
            <span className="bg-urgency-today border border-urgency-todayBorder text-urgency-todayText text-xs font-medium px-2.5 py-0.5 rounded-full">
              Rejected
            </span>
          </div>
          <p className="text-xs text-text-muted mb-4">
            Your payment could not be verified. Please try again with a clear screenshot and correct transaction ID.
          </p>
          <BillingUpgradeForm />
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted mb-3">Choose a plan</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  selectedPlan === "monthly"
                    ? "border-brand bg-brand-light"
                    : "border-line/50 bg-page-surface hover:border-line-strong"
                }`}
              >
                <p className="text-sm font-medium text-text-primary">Monthly</p>
                <p className="text-lg font-medium text-text-primary mt-1">Rs 300</p>
                <p className="text-xs text-text-muted mt-0.5">per month</p>
              </button>
              <button
                onClick={() => setSelectedPlan("semester")}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  selectedPlan === "semester"
                    ? "border-brand bg-brand-light"
                    : "border-line/50 bg-page-surface hover:border-line-strong"
                }`}
              >
                <p className="text-sm font-medium text-text-primary">Semester</p>
                <p className="text-lg font-medium text-text-primary mt-1">Rs 1000</p>
                <p className="text-xs text-text-muted mt-0.5">4 months</p>
              </button>
            </div>
          </div>
          <BillingUpgradeForm plan={selectedPlan} />
        </div>
      )}
    </SettingsSection>
  );
}

