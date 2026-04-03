"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";
import Spinner from "@/components/shared/loaders/Spinner";

export default function LoginForm(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(formData: FormData): Promise<void> {
    let shouldResetLoading = true;
    setLoading(true);
    setError(null);

    try {
      const email = String(formData.get("email") ?? "");
      const password = String(formData.get("password") ?? "");

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (!result || result.error) {
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
    <>
      {loading ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/85 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-900 shadow-lg shadow-slate-200/50">
            <Spinner size="lg" />
            <p className="text-sm font-medium">Signing you in...</p>
          </div>
        </div>
      ) : null}

      <form
        action={onSubmit}
        className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-lg shadow-slate-200/50 transition-all duration-300 sm:p-8"
      >
        <fieldset disabled={loading} className="space-y-4 disabled:pointer-events-none disabled:opacity-60">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900">Sign in to StayDue</h1>
            <p className="text-sm sm:text-base text-slate-600">Access your deadlines and reminder settings.</p>
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
          </div>

          {error ? <p className="text-sm sm:text-base font-medium text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-3 text-sm sm:text-base font-semibold text-white transition-all duration-200 hover:bg-teal-700 active:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <ButtonLoader /> : "Sign in"}
          </button>

          <div className="flex items-center gap-3 py-1 text-xs sm:text-sm text-slate-400">
            <div className="h-px flex-1 bg-slate-300" />
            <span>OR</span>
            <div className="h-px flex-1 bg-slate-300" />
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
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
