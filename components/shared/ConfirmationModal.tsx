"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useConfirmation } from "@/contexts/ConfirmationModalContext";
import ButtonLoader from "@/components/shared/loaders/ButtonLoader";

export default function ConfirmationModal() {
  const { isOpen, options, isLoading, setIsLoading, closeConfirmation } =
    useConfirmation();

  // Handle keyboard escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        closeConfirmation();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, isLoading, closeConfirmation]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "revert";
    };
  }, [isOpen]);

  const handleConfirm = useCallback(async () => {
    if (!options) return;

    setIsLoading(true);
    try {
      // onConfirm is intentionally async — supports API calls from
      // dashboard buttons, future email token links, and WhatsApp webhook responses
      await options.onConfirm();
      closeConfirmation();
    } catch (error) {
      // Error propagates — caller handles error display
      // Reset loading but keep modal open for user to retry or cancel
      setIsLoading(false);
      console.error("[confirmation/error]", error);
    }
  }, [options, setIsLoading, closeConfirmation]);

  const handleBackdropClick = () => {
    if (!isLoading) {
      closeConfirmation();
    }
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && options && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={handleBackdropClick}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <motion.div
            className="bg-page-card border border-line/50 rounded-xl p-6 w-full max-w-sm shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <h2 className="text-base font-medium text-text-primary mb-2">
              {options.title}
            </h2>
            <p className="text-sm text-text-secondary mb-6 leading-relaxed">
              {options.description}
            </p>

            <div className="flex gap-3 justify-end">
              <button
                onClick={closeConfirmation}
                disabled={isLoading}
                className="bg-transparent border border-line hover:border-line-strong text-text-secondary hover:text-text-secondary text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {options.cancelLabel || "Cancel"}
              </button>

              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px] ${
                  options.variant === "destructive"
                    ? "bg-transparent border border-urgency-todayBorder hover:bg-urgency-today text-urgency-todayText"
                    : "bg-brand hover:bg-brand-hover text-white"
                }`}
              >
                {isLoading ? (
                  <ButtonLoader />
                ) : (
                  options.confirmLabel
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
