"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface CalendarUrlFormProps {
  phone: string;
  admissionYears: string[];
}

export default function CalendarUrlForm({
  phone,
  admissionYears,
}: CalendarUrlFormProps): React.ReactElement {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(formData: FormData): Promise<void> {
    setLoading(true);
    setError(null);

    try {
      const url = String(formData.get("url") ?? "");
      const admissionYear = String(formData.get("admissionYear") ?? "");
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, phone, admissionYear }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Could not connect your calendar.");
      }

      router.push("/dashboard");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Could not connect your calendar right now."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      action={onSubmit}
      className="w-full max-w-xl space-y-4 rounded-2xl border border-gray-200 bg-white p-6"
    >
      <h2 className="text-xl font-semibold text-gray-900">Connect your Moodle calendar</h2>
      <p className="text-sm text-gray-500">
        Paste your Moodle export URL to import upcoming deadlines.
      </p>
      <div className="space-y-2">
        <label htmlFor="admissionYear" className="block text-sm font-medium text-gray-700">
          Admission year
        </label>
        <select
          id="admissionYear"
          name="admissionYear"
          className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
          defaultValue=""
          required
        >
          <option value="" disabled>
            Select your admission year
          </option>
          {admissionYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <input
        id="url"
        name="url"
        type="url"
        className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-600"
        placeholder="https://lms.iobm.edu.pk/moodle/calendar/export_execute.php?..."
        required
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-3 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-70"
      >
        {loading ? <ButtonLoader /> : "Sync deadlines"}
      </button>
    </form>
  );
}
