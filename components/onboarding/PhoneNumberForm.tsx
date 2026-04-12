"use client";

import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface PhoneNumberFormProps {
  onVerified: () => void;
}

export default function PhoneNumberForm({ onVerified }: PhoneNumberFormProps): React.ReactElement {
  const [step, setStep] = useState<"idle" | "otp_sent" | "verified">("idle");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendOtp(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/send-phone-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not send verification code");
      setStep("otp_sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send verification code");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not verify code");
      setStep("verified");
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not verify code");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(): Promise<void> {
    setOtp("");
    setError(null);
    await handleSendOtp();
  }

  if (step === "verified") {
    return (
      <div className="w-full max-w-xl rounded-xl border border-line/50 bg-page-card p-6 space-y-2">
        <p className="text-sm font-medium text-urgency-doneText">Number verified</p>
        <p className="text-xs text-text-muted">WhatsApp reminders will be sent to {phone}</p>
      </div>
    );
  }

  if (step === "otp_sent") {
    return (
      <div className="w-full max-w-xl rounded-xl border border-line/50 bg-page-card p-6 space-y-4">
        <div>
          <p className="text-sm font-medium text-text-primary mb-1">Check your email</p>
          <p className="text-xs text-text-secondary">Enter the 6-digit code we sent to your email address</p>
        </div>
        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          placeholder="123456"
          disabled={loading}
          className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleVerify}
          disabled={loading || otp.length < 6}
          className="w-full rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
        >
          {loading ? <ButtonLoader /> : "Verify number"}
        </button>
        {error && <p className="text-sm text-urgency-todayText">{error}</p>}
        <button
          onClick={handleResend}
          disabled={loading}
          className="text-xs text-brand hover:text-brand-hover transition-colors disabled:opacity-50"
        >
          Resend code
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-xl border border-line/50 bg-page-card p-6 space-y-4">
      <div>
        <p className="text-sm font-medium text-text-primary mb-1">Add your WhatsApp number</p>
        <p className="text-xs text-text-secondary">Get deadline reminders directly on WhatsApp</p>
      </div>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+92XXXXXXXXXX"
        disabled={loading}
        className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="bg-urgency-tomorrow border border-urgency-tomorrowBorder rounded-lg px-3 py-2">
        <p className="text-xs text-urgency-tomorrowText">
          This number cannot be changed after verification. Make sure it is correct.
        </p>
      </div>
      <button
        onClick={handleSendOtp}
        disabled={loading || !phone}
        className="w-full rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
      >
        {loading ? <ButtonLoader /> : "Send verification code"}
      </button>
      {error && <p className="text-sm text-urgency-todayText">{error}</p>}
    </div>
  );
}
