"use client";

import { useState } from "react";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

interface BillingUpgradeFormProps {
  plan?: "monthly" | "semester";
}

interface ValidateResponse {
  error?: string;
  originalAmount?: number;
  finalAmount?: number;
  discountValue?: number;
}

export default function BillingUpgradeForm({ plan }: BillingUpgradeFormProps): React.ReactElement {
  const [transactionId, setTransactionId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [discountCode, setDiscountCode] = useState("");
  const [discountResult, setDiscountResult] = useState<{
    originalAmount: number;
    finalAmount: number;
    discountValue: number;
  } | null>(null);
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);

  async function handleValidateCode(): Promise<void> {
    setValidatingCode(true);
    setCodeError(null);
    setDiscountResult(null);
    try {
      const res = await fetch("/api/subscription/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, plan: plan ?? "monthly" }),
      });
      const data = (await res.json()) as ValidateResponse;
      if (!res.ok) throw new Error(data.error ?? "Invalid code");
      setDiscountResult({
        originalAmount: data.originalAmount!,
        finalAmount: data.finalAmount!,
        discountValue: data.discountValue!,
      });
    } catch (err) {
      setCodeError(err instanceof Error ? err.message : "Invalid code");
    } finally {
      setValidatingCode(false);
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!screenshot || !transactionId || !paymentMethod) {
      setError("Please fill in all fields and upload a screenshot");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("plan", plan ?? "monthly");
      formData.append("transactionId", transactionId);
      formData.append("paymentMethod", paymentMethod);
      formData.append("screenshot", screenshot);
      if (discountCode && discountResult) formData.append("discountCode", discountCode);
      const res = await fetch("/api/subscription/submit", { method: "POST", body: formData });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Could not submit payment");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit payment");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="bg-page-surface border border-line/50 rounded-lg p-4 space-y-2">
        <p className="text-xs font-medium uppercase tracking-widest text-text-muted">Send payment to</p>
        <p className="text-sm text-text-primary font-medium">{process.env.NEXT_PUBLIC_BANK_NAME}</p>
        <p className="text-sm text-text-primary">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_NUMBER}</p>
        <p className="text-xs text-text-muted">{process.env.NEXT_PUBLIC_BANK_ACCOUNT_NAME}</p>
      </div>

      <div className="flex items-center gap-2">
        {discountResult ? (
          <>
            <span className="text-sm line-through text-text-muted">Rs {discountResult.originalAmount}</span>
            <span className="text-sm font-medium text-urgency-doneText">Rs {discountResult.finalAmount}</span>
            <span className="text-xs text-urgency-doneText">(-Rs {discountResult.discountValue})</span>
          </>
        ) : (
          <span className="text-sm text-text-secondary">
            Amount: Rs {plan === "semester" ? 1000 : 300}
          </span>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={discountCode}
          onChange={(e) => { setDiscountCode(e.target.value.toUpperCase()); setDiscountResult(null); setCodeError(null); }}
          placeholder="Discount code (optional)"
          disabled={validatingCode}
          className="flex-1 bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-50"
        />
        <button
          onClick={handleValidateCode}
          disabled={validatingCode || !discountCode}
          className="px-3 py-2 rounded-lg border border-line hover:border-line-strong text-text-secondary text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {validatingCode ? <ButtonLoader /> : "Apply"}
        </button>
      </div>
      {codeError && <p className="text-xs text-urgency-todayText">{codeError}</p>}
      {discountResult && <p className="text-xs text-urgency-doneText">Code applied</p>}

      <input
        type="text"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        placeholder="Payment method (e.g. JazzCash, EasyPaisa)"
        disabled={submitting}
        className="w-full bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-50"
      />

      <input
        type="text"
        value={transactionId}
        onChange={(e) => setTransactionId(e.target.value)}
        placeholder="Transaction ID"
        disabled={submitting}
        className="w-full bg-page-surface border border-line rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-brand focus:ring-2 focus:ring-brand/20 transition-colors disabled:opacity-50"
      />

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest text-text-muted mb-2">
          Payment screenshot
        </label>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setScreenshot(e.target.files?.[0] ?? null)}
          disabled={submitting}
          className="w-full text-sm text-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border file:border-line file:bg-page-surface file:text-text-secondary file:text-xs file:font-medium hover:file:border-line-strong transition-colors disabled:opacity-50"
        />
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !screenshot || !transactionId || !paymentMethod}
        className="w-full bg-brand hover:bg-brand-hover text-white text-sm font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {submitting ? <ButtonLoader /> : "Submit payment"}
      </button>
      {error && <p className="text-sm text-urgency-todayText">{error}</p>}
    </div>
  );
}
