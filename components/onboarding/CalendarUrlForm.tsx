"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface CalendarUrlFormProps {
  admissionYears: string[];
  onSuccess: () => void;
}

export default function CalendarUrlForm({
  admissionYears,
  onSuccess,
}: CalendarUrlFormProps): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [admissionYear, setAdmissionYear] = useState("");
  const [helpOpen, setHelpOpen] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setLoading(true);
    setError(null);

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
      const response = await fetch("/api/calendar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, admissionYear }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Could not connect your calendar.");
      }

      onSuccess();
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
        <label
          htmlFor="admissionYear"
          className="block text-xs font-medium uppercase tracking-widest text-text-muted"
        >
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
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="url"
            className="block text-xs font-medium uppercase tracking-widest text-text-muted"
          >
            Calendar URL
          </label>
          <button
            type="button"
            onClick={() => setHelpOpen((v) => !v)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors"
          >
            How do I find this?
            <ChevronDown
              size={12}
              className={`transition-transform duration-200 ${helpOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        {/* Inline help panel */}
        <AnimatePresence initial={false}>
          {helpOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="bg-page-surface border border-line/50 rounded-lg p-4 space-y-3 mb-2">
                <ol className="space-y-2">
                  {[
                    "Log in to lms.iobm.edu.pk with your student credentials.",
                    'Go to Calendar — click the grid icon at the top and select "Calendar".',
                    'Scroll to the bottom and click "Export calendar". Select "All events" and "All courses", then click "Get calendar URL" and copy the full URL.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
                      <span className="w-5 h-5 rounded-full bg-brand-light border border-brand/30 inline-flex items-center justify-center text-[10px] font-medium text-brand shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
                <Link
                  href="/how-to-get-url"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand hover:text-brand-hover transition-colors"
                >
                  View full guide with screenshots
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
