"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface ResetPasswordFormProps {
  token: string;
}

function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-urgency-today" };
  if (score <= 4) return { score, label: "Fair", color: "bg-urgency-tomorrow" };
  return { score, label: "Strong", color: "bg-brand" };
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const isValid = password && passwordsMatch && password.length >= 8;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    let shouldResetLoading = true;
    setLoading(true);
    setError(null);

    try {
      if (!passwordsMatch) {
        throw new Error("Passwords do not match.");
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Could not reset your password.");
      }

      shouldResetLoading = false;
      router.push("/login?reset=true");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not reset your password. Please try again."
      );
    } finally {
      if (shouldResetLoading) {
        setLoading(false);
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-line/50 bg-page-card p-6 shadow-lg transition-all duration-300 space-y-5"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-text-primary">Set a new password</h2>
          <p className="text-sm text-text-secondary">Create a strong password to secure your account.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest text-text-muted" htmlFor="password">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 pr-10 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {password && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">Password strength:</span>
                <span
                  className={`text-xs font-medium ${
                    passwordStrength?.color === "bg-urgency-today"
                      ? "text-urgency-todayText"
                      : passwordStrength?.color === "bg-urgency-tomorrow"
                        ? "text-urgency-tomorrowText"
                        : "text-brand"
                  }`}
                >
                  {passwordStrength?.label}
                </span>
              </div>
              <div className="h-1 w-full rounded-full bg-line overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength?.color}`}
                  style={{ width: `${((passwordStrength?.score ?? 0) / 6) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest text-text-muted" htmlFor="confirm">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 pr-10 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              disabled={loading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && !passwordsMatch && (
            <p className="text-xs text-urgency-todayText">Passwords do not match.</p>
          )}
          {passwordsMatch && (
            <p className="text-xs text-urgency-doneText">Passwords match.</p>
          )}
        </div>

        {error && <p className="text-sm font-medium text-urgency-todayText">{error}</p>}

        <button
          type="submit"
          disabled={!isValid || loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 ${loading ? "py-4" : "py-2.5"} text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {loading ? <ButtonLoader /> : "Reset password"}
        </button>

        <a
          href="/login"
          className="block text-center text-sm font-medium text-brand hover:text-brand-hover transition-colors"
        >
          Back to sign in
        </a>
      </div>
    </form>
  );
}
