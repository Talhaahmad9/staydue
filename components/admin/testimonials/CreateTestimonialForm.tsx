"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, X, Loader2, Upload } from "lucide-react";
import { createTestimonial } from "@/app/admin/testimonials/actions";

const EMPTY = {
  quote: "",
  name: "",
  batch: "",
  course: "",
  order: "0",
};

export default function CreateTestimonialForm() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const data = new FormData();
    data.set("quote", form.quote.trim());
    data.set("name", form.name.trim());
    data.set("batch", form.batch.trim());
    data.set("course", form.course.trim());
    data.set("order", form.order);
    if (photoFile) data.set("photo", photoFile);

    startTransition(async () => {
      const result = await createTestimonial(data);
      if (result.success) {
        setForm(EMPTY);
        setPhotoFile(null);
        if (fileRef.current) fileRef.current.value = "";
        setOpen(false);
      } else {
        setError(result.error ?? "Failed to create testimonial");
      }
    });
  }

  function handleClose() {
    setOpen(false);
    setError(null);
    setForm(EMPTY);
    setPhotoFile(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-lg transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add testimonial
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full bg-page-surface border border-brand/30 rounded-xl p-4 space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">New testimonial</p>
        <button
          type="button"
          onClick={handleClose}
          className="p-1 text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      <div>
        <label className="text-xs text-text-muted block mb-1">Quote *</label>
        <textarea
          required
          value={form.quote}
          onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))}
          placeholder="What the student said about StayDue..."
          rows={3}
          maxLength={500}
          className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand resize-none"
        />
        <p className="text-xs text-text-muted mt-0.5 text-right">{form.quote.length}/500</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-text-muted block mb-1">Name *</label>
          <input
            required
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Sarah A."
            maxLength={80}
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Batch *</label>
          <input
            required
            type="text"
            value={form.batch}
            onChange={(e) => setForm((f) => ({ ...f, batch: e.target.value }))}
            placeholder="Batch 2023"
            maxLength={40}
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Course / Department *</label>
          <input
            required
            type="text"
            value={form.course}
            onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}
            placeholder="Business Administration"
            maxLength={80}
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>
        <div>
          <label className="text-xs text-text-muted block mb-1">Display order</label>
          <input
            type="number"
            min={0}
            max={999}
            value={form.order}
            onChange={(e) => setForm((f) => ({ ...f, order: e.target.value }))}
            placeholder="0"
            className="w-full bg-page-bg border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
          />
        </div>
      </div>

      <div>
        <label className="text-xs text-text-muted block mb-1">
          Profile photo (optional · JPEG/PNG/WebP · max 2MB)
        </label>
        <label className="flex items-center gap-3 bg-page-bg border border-line rounded-lg px-3 py-2 cursor-pointer hover:border-brand transition-colors">
          <Upload className="w-4 h-4 text-text-muted shrink-0" />
          <span className="text-sm text-text-secondary truncate">
            {photoFile ? photoFile.name : "Choose file..."}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            className="sr-only"
          />
        </label>
        {photoFile && (
          <button
            type="button"
            onClick={() => { setPhotoFile(null); if (fileRef.current) fileRef.current.value = ""; }}
            className="text-xs text-text-muted hover:text-red-400 transition-colors mt-1"
          >
            Remove photo
          </button>
        )}
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex items-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          Save testimonial
        </button>
        <button
          type="button"
          onClick={handleClose}
          disabled={isPending}
          className="px-4 py-2 text-sm text-text-muted hover:text-text-secondary transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
