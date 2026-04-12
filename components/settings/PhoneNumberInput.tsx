"use client";

import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface PhoneNumberInputProps {
  initialPhone: string;
  isPhoneVerified: boolean;
  onVerified: (phone: string) => void;
}

export default function PhoneNumberInput({
  initialPhone,
  isPhoneVerified,
  onVerified,
}: PhoneNumberInputProps): React.ReactElement {
  const [step, setStep] = useState<"idle" | "otp_sent" | "verified">(
    isPhoneVerified ? "verified" : "idle"
  );
  const [phone, setPhone] = useState(initialPhone);
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
      onVerified(phone);
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
      <div className="border-t border-line/50 pt-6 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">WhatsApp number</p>
        <div className="flex items-center gap-3">
          <p className="text-sm text-text-primary font-medium">{phone}</p>
          <span className="bg-urgency-done border border-urgency-doneBorder text-urgency-doneText text-xs font-medium px-2.5 py-0.5 rounded-full">
            Verified
          </span>
        </div>
        <p className="text-xs text-text-muted">Your WhatsApp number is verified and cannot be changed.</p>
      </div>
    );
  }

  if (step === "otp_sent") {
    return (
      <div className="border-t border-line/50 pt-6 space-y-3">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">WhatsApp number</p>
        <label htmlFor="phone-otp-input" className="block text-sm text-text-secondary">
          Enter the 6-digit code sent to your email
        </label>
        <input
          id="phone-otp-input"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          maxLength={6}
          inputMode="numeric"
          placeholder="123456"
          disabled={loading}
          className="w-full bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          onClick={handleVerify}
          disabled={loading || otp.length < 6}
          className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
        >
          {loading ? <ButtonLoader /> : "Verify"}
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
    <div className="border-t border-line/50 pt-6 space-y-3">
      <p className="text-xs font-medium uppercase tracking-widest text-text-muted">WhatsApp number</p>
      <input
        type="text"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="+92XXXXXXXXXX"
        disabled={loading}
        className="w-full bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
      <div className="bg-urgency-tomorrow border border-urgency-tomorrowBorder rounded-lg px-3 py-2">
        <p className="text-xs text-urgency-tomorrowText">
          This number cannot be changed after verification. Make sure it is correct.
        </p>
      </div>
      <button
        onClick={handleSendOtp}
        disabled={loading || !phone}
        className="px-4 py-2 rounded-lg bg-brand hover:bg-brand-hover text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
      >
        {loading ? <ButtonLoader /> : "Send verification code"}
      </button>
      {error && <p className="text-sm text-urgency-todayText">{error}</p>}
    </div>
  );
}
