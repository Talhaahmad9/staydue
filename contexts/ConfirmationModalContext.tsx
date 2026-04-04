"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ConfirmationOptions {
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  // onConfirm is intentionally async — supports API calls from
  // dashboard buttons, future email token links, and WhatsApp webhook responses
  onConfirm: () => Promise<void>;
}

interface ConfirmationContextType {
  openConfirmation: (options: ConfirmationOptions) => void;
  closeConfirmation: () => void;
  isOpen: boolean;
  options: ConfirmationOptions | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openConfirmation = useCallback((newOptions: ConfirmationOptions) => {
    setOptions(newOptions);
    setIsOpen(true);
    setIsLoading(false);
  }, []);

  const closeConfirmation = useCallback(() => {
    setIsOpen(false);
    setOptions(null);
    setIsLoading(false);
  }, []);

  const value: ConfirmationContextType = {
    openConfirmation,
    closeConfirmation,
    isOpen,
    options,
    isLoading,
    setIsLoading,
  };

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
    </ConfirmationContext.Provider>
  );
}

export function useConfirmation(): ConfirmationContextType {
  const context = useContext(ConfirmationContext);
  if (context === undefined) {
    throw new Error("useConfirmation must be used within ConfirmationModalProvider");
  }
  return context;
}
