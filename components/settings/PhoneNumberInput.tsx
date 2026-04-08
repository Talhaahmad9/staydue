"use client";

import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface PhoneNumberInputProps {
  initialPhone: string;
  onSave: (phone: string) => void;
}

export default function PhoneNumberInput({ initialPhone, onSave }: PhoneNumberInputProps): React.ReactElement {
  const [phone, setPhone] = useState(initialPhone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSave(): Promise<void> {
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/settings/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = (await response.json()) as { error?: string; success?: boolean };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update phone number");
      }

      setSuccess(true);
      onSave(phone);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update phone number");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="border-t border-line/50 pt-6 space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-text-muted">WhatsApp number</p>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+92XXXXXXXXXX"
        disabled={saving}
        className="w-full bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving || !phone}
          className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {saving ? <ButtonLoader /> : "Save"}
        </button>
      </div>
      {error && <p className="text-sm text-urgency-todayText">{error}</p>}
      {success && (
        <div className="bg-brand-light border border-brand/40 text-brand text-xs px-3 py-2 rounded-lg">
          You will receive WhatsApp reminders on this number
        </div>
      )}
      {phone && !success && (
        <p className="text-xs text-text-muted">WhatsApp reminders will be sent to this number</p>
      )}
    </div>
  );
}
