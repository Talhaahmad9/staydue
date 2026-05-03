import type { Metadata } from "next";
import { ConfirmationModalProvider } from "@/contexts/ConfirmationModalContext";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmationModalProvider>
      {children}
      <ConfirmationModal />
    </ConfirmationModalProvider>
  );
}
