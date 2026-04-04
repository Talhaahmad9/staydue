import { ConfirmationModalProvider } from "@/contexts/ConfirmationModalContext";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

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
