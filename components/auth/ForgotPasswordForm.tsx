"use client";

import { useState } from "react";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

export default function ForgotPasswordForm(): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Could not process your request.");
      }

      setSuccess(true);
      setEmail("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="w-full rounded-xl border border-line/50 bg-page-card p-6 shadow-lg transition-all duration-300 space-y-5">
        <div className="space-y-4">
          <div className="space-y-3">
            <h2 className="text-xl font-medium text-text-primary">Check your email</h2>
            <p className="text-sm text-text-secondary">
              If an account exists for this email, you&apos;ll receive a reset link shortly.
            </p>
          </div>

          <a
            href="/login"
            className="flex w-full items-center justify-center rounded-lg bg-brand hover:bg-brand-hover px-4 py-2.5 text-sm font-medium text-white transition-colors"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-xl border border-line/50 bg-page-card p-6 shadow-lg transition-all duration-300 space-y-5"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-medium text-text-primary">Reset your password</h2>
          <p className="text-sm text-text-secondary">Enter your email and we&apos;ll send you a reset link.</p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-medium uppercase tracking-widest text-text-muted" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
            placeholder="you@university.edu"
            required
          />
        </div>

        {error && <p className="text-sm font-medium text-urgency-todayText">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`flex w-full items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 ${loading ? "py-4" : "py-2.5"} text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {loading ? <ButtonLoader /> : "Send reset link"}
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
