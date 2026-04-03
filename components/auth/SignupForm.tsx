"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

export default function SignupForm(): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
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

      router.push("/login?created=true");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not create your account right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={onSubmit}
      className="w-full max-w-md space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
      <p className="text-sm text-gray-500">Start tracking Moodle deadlines in one place.</p>

      <label className="block text-sm font-medium text-gray-700" htmlFor="name">
        Name
      </label>
      <input
        id="name"
        name="name"
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
        required
      />

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
        {loading ? <ButtonLoader /> : "Create account"}
      </button>
    </form>
  );
}
