"use client";

import { useState } from "react";
import SettingsSection from "./SettingsLayout";
import type { SettingsUserData } from "@/app/settings/page";

interface NotificationSettingsProps {
  user: SettingsUserData;
}

export default function NotificationSettings({ user }: NotificationSettingsProps): React.ReactElement {
  const [emailEnabled, setEmailEnabled] = useState(user.notificationPreferences?.emailEnabled ?? true);
  const [reminderIntervals, setReminderIntervals] = useState(
    user.notificationPreferences?.reminderIntervals ?? ["3-day", "1-day", "day-of"]
  );
  const [phone, setPhone] = useState(user.phone ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleEmailToggle(enabled: boolean): Promise<void> {
    setEmailEnabled(enabled);
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailEnabled: enabled }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update email settings");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update email settings");
      setEmailEnabled(!enabled); // Revert on error
    } finally {
      setSaving(false);
    }
  }

  async function handleIntervalChange(interval: string): Promise<void> {
    const newIntervals = reminderIntervals.includes(interval)
      ? reminderIntervals.filter((i) => i !== interval)
      : [...reminderIntervals, interval];

    // Must have at least one interval selected
    if (newIntervals.length === 0) {
      return;
    }

    setReminderIntervals(newIntervals);
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reminderIntervals: newIntervals }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update reminder intervals");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update reminder intervals");
      // Revert on error
      const oldIntervals = user.notificationPreferences?.reminderIntervals ?? ["3-day", "1-day", "day-of"];
      setReminderIntervals(oldIntervals);
    } finally {
      setSaving(false);
    }
  }

  const intervalLabels: Record<string, string> = {
    "3-day": "3 days before deadline",
    "1-day": "1 day before deadline",
    "day-of": "On the day of the deadline",
  };

  return (
    <SettingsSection title="Notifications" description="Manage how you receive deadline reminders">
      <div className="space-y-8">
        {/* Email Notifications Toggle */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text-primary">Email reminders</p>
              <p className="text-xs text-text-muted mt-0.5">Receive deadline reminders by email</p>
            </div>
            <button
              onClick={() => handleEmailToggle(!emailEnabled)}
              disabled={saving}
              className={`relative w-10 h-6 rounded-full transition-colors ${
                emailEnabled ? "bg-brand" : "bg-line"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              role="switch"
              aria-checked={emailEnabled}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  emailEnabled ? "left-5" : "left-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reminder Intervals (show only if email enabled) */}
        {emailEnabled && (
          <div className="space-y-3 border-t border-line/50 pt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-text-muted">Remind me</p>
            <div className="space-y-3">
              {["3-day", "1-day", "day-of"].map((interval) => (
                <label key={interval} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={reminderIntervals.includes(interval)}
                    onChange={() => handleIntervalChange(interval)}
                    disabled={saving || (reminderIntervals.length === 1 && reminderIntervals.includes(interval))}
                    className="w-4 h-4 rounded border border-line bg-page-surface accent-brand cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                    {intervalLabels[interval]}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Phone Number */}
        <div className="border-t border-line/50 pt-6 space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-text-muted">WhatsApp number</p>
          <p className="text-xs text-text-muted">For WhatsApp reminders — coming soon</p>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+92XXXXXXXXXX"
            disabled={true}
            className="w-full bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-muted outline-none cursor-not-allowed"
          />
          <span className="inline-block bg-page-surface border border-line text-text-muted text-xs px-2 py-0.5 rounded-full mt-2">
            WhatsApp reminders coming soon
          </span>
        </div>

        {/* Messages */}
        {error && <p className="text-sm text-urgency-todayText">{error}</p>}
        {success && <p className="text-sm text-urgency-doneText">Settings updated</p>}
      </div>
    </SettingsSection>
  );
}
