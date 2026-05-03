"use client";

import { useEffect, useState } from "react";

interface StatusResponse {
  isPro: boolean;
  proDaysLeft: number | null;
  trialDaysLeft: number | null;
  hasPhone: boolean;
}

interface SubscriptionBadgeProps {
  compact?: boolean;
}

export default function SubscriptionBadge({ compact = false }: SubscriptionBadgeProps): React.ReactElement | null {
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

  if (compact) {
    if (isPro) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand/15 text-brand border border-brand/30">
          Pro
        </span>
      );
    }
    if (trialDaysLeft !== null && trialDaysLeft > 0) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
          Trial
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-urgency-today border border-urgency-todayBorder text-urgency-todayText">
        Ended
      </span>
    );
  }

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
