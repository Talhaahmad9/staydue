"use client";

import { ConfirmationModalProvider } from "@/contexts/ConfirmationModalContext";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export default function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmationModalProvider>
      {children}
      <ConfirmationModal />
    </ConfirmationModalProvider>
  );
}
