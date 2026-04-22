"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { Trash2, Eye, EyeOff, Loader2 } from "lucide-react";
import type { AdminTestimonial } from "@/lib/admin";
import {
  deleteTestimonial,
  toggleTestimonialVisibility,
  updateTestimonialOrder,
} from "@/app/admin/testimonials/actions";
import { getTestimonialPhotoUrl } from "@/lib/r2";
import { useConfirmation } from "@/contexts/ConfirmationModalContext";

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function TestimonialRow({ testimonial }: { testimonial: AdminTestimonial }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [orderInput, setOrderInput] = useState(String(testimonial.order));
  const { openConfirmation } = useConfirmation();
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoLoading, setPhotoLoading] = useState(false);

  async function loadPhoto() {
    if (!testimonial.photoKey || photoUrl) return;
    setPhotoLoading(true);
    const result = await getTestimonialPhotoUrl(testimonial.photoKey);
    if (result.success && result.url) setPhotoUrl(result.url);
    setPhotoLoading(false);
  }

  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  function handleToggleVisibility() {
    setError(null);
    startTransition(async () => {
      const result = await toggleTestimonialVisibility(testimonial.id, !testimonial.isVisible);
      if (!result.success) setError(result.error ?? "Failed");
    });
  }

  function handleDelete() {
    setError(null);
    openConfirmation({
      title: "Delete testimonial",
      description: `"${testimonial.name}" will be permanently removed from the landing page.`,
      confirmLabel: "Delete",
      variant: "destructive",
      onConfirm: async () => {
        const result = await deleteTestimonial(testimonial.id);
        if (!result.success) setError(result.error ?? "Failed to delete");
      },
    });
  }

  function handleOrderBlur() {
    const val = parseInt(orderInput, 10);
    if (isNaN(val) || val === testimonial.order) return;
    startTransition(async () => {
      const result = await updateTestimonialOrder(testimonial.id, val);
      if (!result.success) setError(result.error ?? "Failed");
    });
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden">
      <div className="px-4 py-3.5 bg-page-surface flex flex-col sm:flex-row sm:items-start gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full bg-brand-light border border-brand/30 flex items-center justify-center overflow-hidden shrink-0"
          onMouseEnter={loadPhoto}
        >
          {testimonial.photoKey ? (
            photoLoading ? (
              <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
            ) : photoUrl ? (
              <Image src={photoUrl} alt={testimonial.name} width={40} height={40} className="w-full h-full object-cover" unoptimized />
            ) : (
              <span className="text-xs font-medium text-brand">{initials}</span>
            )
          ) : (
            <span className="text-xs font-medium text-brand">{initials}</span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-medium text-text-primary">{testimonial.name}</p>
            <span className="text-xs text-text-muted">{testimonial.batch} · {testimonial.course} · IOBM</span>
            <span className={`ml-auto text-xs px-2 py-0.5 rounded-md border font-medium ${
              testimonial.isVisible
                ? "bg-brand/10 text-brand border-brand/30"
                : "bg-page-hover text-text-muted border-line"
            }`}>
              {testimonial.isVisible ? "Visible" : "Hidden"}
            </span>
          </div>
          <p className="text-sm text-text-secondary leading-relaxed line-clamp-2">
            &ldquo;{testimonial.quote}&rdquo;
          </p>
          <p className="text-xs text-text-muted">Added {formatDate(testimonial.createdAt)}</p>
        </div>
      </div>

      {/* Controls row */}
      <div className="border-t border-line bg-page-bg px-4 py-2.5 flex flex-wrap items-center gap-3">
        {error && <p className="text-xs text-red-400 flex-1">{error}</p>}

        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <label htmlFor={`order-${testimonial.id}`}>Order</label>
          <input
            id={`order-${testimonial.id}`}
            type="number"
            min={0}
            max={999}
            value={orderInput}
            onChange={(e) => setOrderInput(e.target.value)}
            onBlur={handleOrderBlur}
            className="w-14 bg-page-surface border border-line rounded px-2 py-0.5 text-xs text-text-primary focus:outline-none focus:border-brand"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={handleToggleVisibility}
            disabled={isPending}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-text-secondary hover:text-text-primary border border-line hover:border-line-strong rounded-lg transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : testimonial.isVisible ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            {testimonial.isVisible ? "Hide" : "Show"}
          </button>

          <button
              onClick={handleDelete}
              disabled={isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-400 border border-red-500/20 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
        </div>
      </div>
    </div>
  );
}

export default function TestimonialAdminList({ testimonials }: { testimonials: AdminTestimonial[] }) {
  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12 bg-page-surface border border-line rounded-xl">
        <p className="text-text-secondary text-sm">No testimonials yet</p>
        <p className="text-text-muted text-xs mt-1">Add your first testimonial above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {testimonials.map((t) => (
        <TestimonialRow key={t.id} testimonial={t} />
      ))}
    </div>
  );
}
