import type { Metadata } from "next";
import { ConfirmationModalProvider } from "@/contexts/ConfirmationModalContext";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfirmationModalProvider>
      <ConfirmationModal />
      {children}
    </ConfirmationModalProvider>
  );
}
