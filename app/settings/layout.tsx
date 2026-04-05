import { ConfirmationModalProvider } from "@/contexts/ConfirmationModalContext";
import ConfirmationModal from "@/components/shared/ConfirmationModal";

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
