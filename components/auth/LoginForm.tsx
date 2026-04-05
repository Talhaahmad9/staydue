"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

export default function LoginForm(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function handleFormSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    let shouldResetLoading = true;
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
        // Check if error is EMAIL_NOT_VERIFIED
        if (result?.error === "EMAIL_NOT_VERIFIED") {
          shouldResetLoading = false;
          router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          router.refresh();
          return;
        }
        setError("Invalid email or password.");
        return;
      }

      shouldResetLoading = false;
      router.push("/onboarding");
      router.refresh();
    } finally {
      if (shouldResetLoading) {
        setLoading(false);
      }
    }
  }

  async function loginWithGoogle(): Promise<void> {
    let shouldResetLoading = true;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("google", { callbackUrl: "/onboarding" });

      if (result?.error) {
        setError("Google sign-in failed. Please try again.");
        return;
      }

      shouldResetLoading = false;
    } finally {
      if (shouldResetLoading) {
        setLoading(false);
      }
    }
  }

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full rounded-xl border border-line/50 bg-page-card p-6 shadow-lg transition-all duration-300 space-y-5"
    >
      <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-xl font-medium text-text-primary">Sign in to StayDue</h2>
            <p className="text-sm text-text-secondary">Access your deadlines and reminder settings.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-widest text-text-muted" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-medium uppercase tracking-widest text-text-muted" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
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
          </div>

          {error ? <p className="text-sm font-medium text-urgency-todayText">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className={`flex w-full items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 ${loading ? "py-4" : "py-2.5"} text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {loading ? <ButtonLoader /> : "Sign in"}
          </button>

          <div className="flex items-center gap-3 py-1">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs text-text-muted uppercase tracking-widest">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={loading}
            className={`flex w-full items-center justify-center gap-3 rounded-lg border border-line hover:border-line-strong hover:bg-page-hover px-4 ${loading ? "py-4" : "py-2.5"} text-sm font-medium text-text-secondary hover:text-text-primary transition-colors disabled:cursor-not-allowed disabled:opacity-60`}
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
      </div>
    </form>
  );
}
