"use client";

import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";
import Spinner from "@/components/shared/loaders/Spinner";
import SettingsSection from "./SettingsLayout";
import type { SettingsUserData } from "@/app/settings/page";

interface CalendarSettingsProps {
  user: SettingsUserData;
}

export default function CalendarSettings({ user }: CalendarSettingsProps): React.ReactElement {
  const [newUrl, setNewUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  async function handleUrlUpdate(): Promise<void> {
    if (!newUrl.trim()) {
      setError("Please enter a calendar URL");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/calendar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl.trim() }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update calendar URL");
      }

      setSuccess(true);
      setNewUrl("");

      // Trigger sync after successful URL update
      await handleSync();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update calendar URL");
    } finally {
      setSaving(false);
    }
  }

  async function handleSync(): Promise<void> {
    setSyncing(true);
    setError(null);

    try {
      const response = await fetch("/api/calendar/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not sync calendar");
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sync calendar");
    } finally {
      setSyncing(false);
    }
  }

  function handleCopyUrl(): void {
    if (user.moodleCalendarUrl) {
      navigator.clipboard.writeText(user.moodleCalendarUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  }

  return (
    <SettingsSection title="Calendar" description="Manage your Moodle calendar settings">
      <div className="space-y-6">
        {/* Current Calendar URL */}
        {user.moodleCalendarUrl && (
          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-widest text-text-muted">
              Current calendar URL
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={user.moodleCalendarUrl}
                disabled
                title={user.moodleCalendarUrl}
                className="flex-1 bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-muted outline-none cursor-not-allowed overflow-hidden"
              />
              <button
                onClick={handleCopyUrl}
                className="px-3 py-2 bg-page-surface border border-line hover:border-line-strong text-text-secondary hover:text-text-primary text-sm font-medium rounded-lg transition-colors"
              >
                {copiedUrl ? "Copied" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Update URL */}
        <div className="space-y-2">
          <label htmlFor="cal-url" className="block text-xs font-medium uppercase tracking-widest text-text-muted">
            Update URL
          </label>
          <input
            id="cal-url"
            type="text"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://lms.iobm.edu.pk/calendar/export.php?..."
            className="w-full bg-page-surface border border-line focus:border-brand focus:ring-2 focus:ring-brand/20 rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none transition-colors"
          />
          <button
            onClick={handleUrlUpdate}
            disabled={saving || !newUrl.trim()}
            className="px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {saving ? <ButtonLoader /> : "Update"}
          </button>
        </div>

        {/* Sync section */}
        <div className="border-t border-line/50 pt-6 space-y-3">
          <div>
            {user.moodleCalendarUrl ? (
              <p className="text-xs text-text-muted mb-3">
                Last synced: {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString("en-GB", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "Never synced"}
              </p>
            ) : (
              <p className="text-xs text-text-muted mb-3">Never synced</p>
            )}
          </div>

          <button
            onClick={handleSync}
            disabled={syncing || !user.moodleCalendarUrl}
            className="px-4 py-2 bg-page-surface border border-line hover:border-line-strong text-text-secondary hover:text-text-primary text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px]"
          >
            {syncing ? <Spinner size="sm" /> : "Sync now"}
          </button>
        </div>

        {/* Messages */}
        {error && <p className="text-sm text-urgency-todayText">{error}</p>}
        {success && <p className="text-sm text-urgency-doneText">Synced successfully</p>}
      </div>
    </SettingsSection>
  );
}
