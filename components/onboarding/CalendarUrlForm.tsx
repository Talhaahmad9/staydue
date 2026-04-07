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
  const [url, setUrl] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields first
    if (!url.trim()) {
      setError("Please enter a calendar URL.");
      setLoading(false);
      return;
    }

    if (!admissionYear.trim()) {
      setError("Please select an admission year.");
      setLoading(false);
      return;
    }

    try {
      const payload = { url, phone, admissionYear };
      console.log("[CalendarUrlForm] Payload before fetch:", JSON.stringify(payload));

      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-xl border border-line/50 bg-page-card p-6 space-y-5"
    >
      <div>
        <h2 className="text-lg font-medium text-text-primary">Connect your Moodle calendar</h2>
        <p className="text-sm text-text-secondary mt-1">
          Paste your Moodle export URL to import upcoming deadlines.
        </p>
      </div>
      <div className="space-y-2">
        <label htmlFor="admissionYear" className="block text-xs font-medium uppercase tracking-widest text-text-muted">
          Admission year
        </label>
        <select
          id="admissionYear"
          value={admissionYear}
          onChange={(event) => setAdmissionYear(event.target.value)}
          className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20"
          required
        >
          <option value="" disabled className="bg-page-surface text-text-primary">
            Select your admission year
          </option>
          {admissionYears.map((year) => (
            <option key={year} value={year} className="bg-page-surface text-text-primary">
              {year.split("-")[0]}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <label htmlFor="url" className="block text-xs font-medium uppercase tracking-widest text-text-muted">
          Calendar URL
        </label>
        <input
          id="url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          className="w-full rounded-lg border border-line bg-page-surface px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-brand focus:ring-2 focus:ring-brand/20"
          placeholder="https://lms.iobm.edu.pk/moodle/calendar/export_execute.php?..."
          required
        />
      </div>
      {error ? <p className="text-sm font-medium text-urgency-todayText">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand-hover px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? <ButtonLoader /> : "Sync deadlines"}
      </button>
    </form>
  );
}
