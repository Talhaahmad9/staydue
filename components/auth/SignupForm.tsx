"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";
import Spinner from "@/components/shared/loaders/Spinner";

function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;

  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 4) return { score, label: "Fair", color: "bg-yellow-500" };
  return { score, label: "Strong", color: "bg-teal-600" };
}

export default function SignupForm(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  async function onSubmit(formData: FormData): Promise<void> {
    let shouldResetLoading = true;
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: password,
      };

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Could not create your account.");
      }

      shouldResetLoading = false;
      router.push("/login?created=true");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create your account right now."
      );
    } finally {
      if (shouldResetLoading) {
        setLoading(false);
      }
    }
  }

  async function signupWithGoogle(): Promise<void> {
    let shouldResetLoading = true;
    setLoading(true);
    setError(null);

    try {
      const result = await signIn("google", { callbackUrl: "/onboarding" });

      if (result?.error) {
        setError("Google sign-up failed. Please try again.");
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
    <>
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-900 shadow-lg shadow-slate-200/50">
            <Spinner size="lg" />
            <p className="text-sm font-medium">Creating your account...</p>
          </div>
        </div>
      ) : null}

      <form
        action={onSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 transition-all duration-300 sm:p-8"
      >
        <fieldset disabled={loading} className="space-y-4 disabled:pointer-events-none disabled:opacity-60">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Create your account</h1>
            <p className="text-sm sm:text-base text-slate-600">Start tracking Moodle deadlines in one place.</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-slate-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              name="name"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm sm:text-base text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200"
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm sm:text-base text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200"
              placeholder="you@university.edu"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm sm:text-base font-medium text-slate-700" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-sm sm:text-base text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-2 focus:ring-teal-200"
                minLength={8}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {password && (
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm text-slate-600">Password strength:</span>
                  <span className={`text-xs sm:text-sm font-medium ${passwordStrength?.color === "bg-red-500" ? "text-red-600" : passwordStrength?.color === "bg-yellow-500" ? "text-yellow-600" : "text-teal-600"}`}>
                    {passwordStrength?.label}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passwordStrength?.color}`}
                    style={{ width: `${((passwordStrength?.score ?? 0) / 6) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {error ? <p className="text-sm sm:text-base font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <ButtonLoader /> : "Create account"}
          </button>

          <div className="flex items-center gap-3 py-1 text-xs sm:text-sm text-slate-400">
            <div className="h-px flex-1 bg-slate-300" />
            <span>OR</span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <button
            type="button"
            onClick={signupWithGoogle}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm sm:text-base font-semibold text-slate-700 transition-all duration-200 hover:border-slate-400 hover:bg-white active:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </fieldset>
      </form>
    </>
  );
}
