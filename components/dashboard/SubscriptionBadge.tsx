"use client";

import { useEffect, useState } from "react";

interface StatusResponse {
  isPro: boolean;
  proDaysLeft: number | null;
  trialDaysLeft: number | null;
  hasPhone: boolean;
}

export default function SubscriptionBadge(): React.ReactElement | null {
  const [status, setStatus] = useState<StatusResponse | null>(null);

  useEffect(() => {
    fetch("/api/subscription/status")
      .then((res) => {
        if (!res.ok) return null;
        return res.json() as Promise<StatusResponse>;
      })
      .then((data) => {
        if (data) setStatus(data);
      })
      .catch(() => {});
  }, []);

  if (!status) return null;

  const { isPro, proDaysLeft, trialDaysLeft, hasPhone } = status;

  if (!hasPhone) return null;

  if (isPro && proDaysLeft !== null) {
    return (
      <div className="bg-brand-light border border-brand/40 rounded-lg px-3 py-2">
        <p className="text-xs font-medium text-brand">Pro plan</p>
        <p className="text-xs text-text-muted">{proDaysLeft} days remaining</p>
      </div>
    );
  }

  if (!isPro && trialDaysLeft !== null && trialDaysLeft > 0) {
    return (
      <div className="bg-page-card border border-line/50 rounded-lg px-3 py-2">
        <p className="text-xs font-medium text-text-primary">Free trial</p>
        <p className="text-xs text-text-muted">{trialDaysLeft} days remaining</p>
      </div>
    );
  }

  if (!isPro && (trialDaysLeft === 0 || trialDaysLeft === null)) {
    return (
      <div className="bg-urgency-today border border-urgency-todayBorder rounded-lg px-3 py-2">
        <p className="text-xs font-medium text-urgency-todayText">Trial ended</p>
        <p className="text-xs text-text-muted">Upgrade to continue WhatsApp reminders</p>
      </div>
    );
  }

  return null;
}
