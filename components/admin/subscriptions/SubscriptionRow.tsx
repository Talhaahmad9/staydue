"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, Check, X, Loader2 } from "lucide-react";
import type { AdminSub } from "@/lib/admin";
import {
  approveSubscription,
  rejectSubscription,
  revokeSubscription,
  getSubscriptionScreenshotUrl,
} from "@/app/admin/subscriptions/actions";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  active: "bg-brand/15 text-brand border-brand/30",
  expired: "bg-page-hover text-text-muted border-line",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

function formatDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

interface Props {
  sub: AdminSub;
}

export default function SubscriptionRow({ sub }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleExpand() {
    const next = !expanded;
    setExpanded(next);
    if (next && !screenshotUrl && sub.screenshotKey) {
      setScreenshotLoading(true);
      const result = await getSubscriptionScreenshotUrl(sub.screenshotKey);
      if (result.success && result.url) setScreenshotUrl(result.url);
      setScreenshotLoading(false);
    }
  }

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const result = await approveSubscription(sub.id);
      if (!result.success) setError(result.error ?? "Failed to approve");
    });
  }

  function handleReject() {
    if (!showRejectInput) {
      setShowRejectInput(true);
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await rejectSubscription(sub.id, rejectReason);
      if (!result.success) setError(result.error ?? "Failed to reject");
    });
  }

  return (
    <div className="border border-line rounded-xl overflow-hidden">
      {/* Row header — always visible */}
      <button
        onClick={handleExpand}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-page-surface hover:bg-page-hover transition-colors text-left"
      >
        <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-4 items-center">
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{sub.userName}</p>
            <p className="text-xs text-text-muted truncate">{sub.userEmail}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${STATUS_STYLES[sub.status] ?? ""}`}>
              {sub.status}
            </span>
            <span className="text-xs text-text-secondary capitalize">{sub.plan}</span>
            <span className="text-xs font-medium text-text-primary">
              {sub.currency} {sub.amount.toLocaleString()}
            </span>
          </div>
          <p className="text-xs text-text-muted">{formatDate(sub.createdAt)}</p>
        </div>
        <div className="shrink-0 text-text-muted">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-line bg-page-bg px-4 py-4 space-y-4">
          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
            <div>
              <p className="text-xs text-text-muted mb-0.5">Transaction ID</p>
              <p className="text-text-primary font-mono text-xs break-all">{sub.transactionId}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Payment method</p>
              <p className="text-text-primary">{sub.paymentMethod}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">Start date</p>
              <p className="text-text-primary">{formatDate(sub.startDate)}</p>
            </div>
            <div>
              <p className="text-xs text-text-muted mb-0.5">End date</p>
              <p className="text-text-primary">{formatDate(sub.endDate)}</p>
            </div>
            {sub.reviewedBy && (
              <div>
                <p className="text-xs text-text-muted mb-0.5">Reviewed by</p>
                <p className="text-text-primary text-xs">{sub.reviewedBy}</p>
              </div>
            )}
            {sub.rejectionReason && (
              <div className="col-span-2 sm:col-span-4">
                <p className="text-xs text-text-muted mb-0.5">Rejection reason</p>
                <p className="text-red-400 text-xs">{sub.rejectionReason}</p>
              </div>
            )}
          </div>

          {/* Screenshot */}
          {sub.screenshotKey && (
            <div>
              <p className="text-xs text-text-muted mb-2">Payment screenshot</p>
              {screenshotLoading ? (
                <div className="w-full h-48 bg-page-surface rounded-lg flex items-center justify-center">
                  <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
                </div>
              ) : screenshotUrl ? (
                <a href={screenshotUrl} target="_blank" rel="noopener noreferrer">
                  <div className="relative w-full max-w-sm h-64 rounded-lg overflow-hidden border border-line hover:border-brand transition-colors">
                    <Image
                      src={screenshotUrl}
                      alt="Payment screenshot"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <p className="text-xs text-text-muted mt-1">Click to open full size</p>
                </a>
              ) : (
                <p className="text-xs text-red-400">Could not load screenshot</p>
              )}
            </div>
          )}

          {/* Actions — only for active */}
          {sub.status === "active" && (
            <div className="space-y-3">
              {error && <p className="text-xs text-red-400">{error}</p>}
              {showRevokeConfirm ? (
                <div className="space-y-2">
                  <p className="text-xs text-text-secondary">
                    This will expire the subscription and revoke the user&apos;s Pro access.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setError(null);
                        startTransition(async () => {
                          const result = await revokeSubscription(sub.id);
                          if (!result.success) setError(result.error ?? "Failed to revoke");
                          else setShowRevokeConfirm(false);
                        });
                      }}
                      disabled={isPending}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 border border-red-500/20 text-sm font-medium rounded-lg transition-colors"
                    >
                      {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                      Confirm revoke
                    </button>
                    <button
                      onClick={() => setShowRevokeConfirm(false)}
                      disabled={isPending}
                      className="text-sm text-text-muted hover:text-text-secondary transition-colors px-2"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowRevokeConfirm(true)}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-sm font-medium rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Revoke subscription
                </button>
              )}
            </div>
          )}

          {/* Actions — only for pending */}
          {sub.status === "pending" && (
            <div className="space-y-3">
              {error && (
                <p className="text-xs text-red-400">{error}</p>
              )}
              {showRejectInput && (
                <div>
                  <label className="text-xs text-text-muted block mb-1">
                    Rejection reason (shown to user)
                  </label>
                  <input
                    type="text"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="e.g. Screenshot unclear, transaction ID not found"
                    className="w-full bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand"
                    maxLength={200}
                  />
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-brand hover:bg-brand-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Approve
                </button>
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 text-red-400 border border-red-500/20 text-sm font-medium rounded-lg transition-colors"
                >
                  {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  {showRejectInput ? "Confirm rejection" : "Reject"}
                </button>
                {showRejectInput && (
                  <button
                    onClick={() => { setShowRejectInput(false); setRejectReason(""); }}
                    disabled={isPending}
                    className="text-sm text-text-muted hover:text-text-secondary transition-colors px-2"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
