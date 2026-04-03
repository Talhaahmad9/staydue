"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

export default function LoginForm(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData): Promise<void> {
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

      router.push("/onboarding");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(): Promise<void> {
    setLoading(true);
    setError(null);
    await signIn("google", { callbackUrl: "/onboarding" });
    setLoading(false);
  }

  return (
    <form
      action={onSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <h1 className="text-2xl font-semibold text-gray-900">Sign in to StayDue</h1>
      <p className="text-sm text-gray-500">Access your deadlines and reminder settings.</p>

      <label className="block text-sm font-medium text-gray-700" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
        required
      />

      <label className="block text-sm font-medium text-gray-700" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
        minLength={8}
        required
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-70"
      >
        {loading ? <ButtonLoader /> : "Sign in"}
      </button>

      <button
        type="button"
        onClick={loginWithGoogle}
        disabled={loading}
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-70"
      >
        Continue with Google
      </button>
    </form>
  );
}
