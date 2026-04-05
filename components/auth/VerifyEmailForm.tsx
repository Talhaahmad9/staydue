"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface VerifyEmailFormProps {
  email: string;
}

export default function VerifyEmailForm({ email }: VerifyEmailFormProps): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (otp.every((digit) => digit !== "")) {
      const finalOtp = otp.join("");

      const submitOtp = async (): Promise<void> => {
        setLoading(true);
        setError(null);

        try {
          const response = await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp: finalOtp }),
          });

          if (!response.ok) {
            const data = (await response.json()) as { error?: string };
            throw new Error(data.error ?? "Could not verify your email.");
          }

          router.push("/login?verified=true");
          router.refresh();
        } catch (submitError) {
          setError(
            submitError instanceof Error
              ? submitError.message
              : "Could not verify your email. Please try again."
          );
          setOtp(["", "", "", "", "", ""]);
          setLoading(false);
        }
      };

      submitOtp();
    }
  }, [otp, email, router]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown <= 0) return;

    const timer = setTimeout(() => {
      setResendCountdown(resendCountdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string): void => {
    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value.slice(-1); // Only keep last character
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = inputRefs.current[index + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = inputRefs.current[index - 1];
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  async function handleResend(): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Could not resend OTP.");
      }

      setResendCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      const firstInput = inputRefs.current[0];
      if (firstInput) {
        firstInput.focus();
      }
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not resend OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-line/50 bg-page-card p-6 shadow-lg transition-all duration-300 space-y-5">
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-text-primary">Verify your email</h2>
          <p className="text-sm text-text-secondary">
            Enter the 6-digit code we sent to <span className="font-medium text-text-primary">{email}</span>
          </p>
        </div>

        {/* OTP Input Boxes */}
        <form
          onSubmit={(e) => e.preventDefault()}
          autoComplete="one-time-code"
        >
          <div className="flex gap-2 justify-center py-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="one-time-code"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                disabled={loading}
                className="w-12 h-16 text-center text-2xl font-medium rounded-lg border border-line bg-page-surface text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`OTP digit ${index + 1}`}
              />
            ))}
          </div>
        </form>

        {error && <p className="text-sm font-medium text-urgency-todayText text-center">{error}</p>}

        {/* Resend OTP Button */}
        <div className="text-center pt-2">
          {resendCountdown > 0 ? (
            <p className="text-sm text-text-muted">
              Resend code in {resendCountdown}s
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={loading}
              className="text-sm font-medium text-brand hover:text-brand-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Resend code
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
