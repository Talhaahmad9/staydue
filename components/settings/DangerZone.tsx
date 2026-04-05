"use client";

import { useRouter } from "next/navigation";
import { useConfirmation } from "@/contexts/ConfirmationModalContext";
import SettingsSection from "./SettingsLayout";

export default function DangerZone(): React.ReactElement {
  const router = useRouter();
  const confirmationModal = useConfirmation();

  async function handleDeleteAccount(): Promise<void> {
    confirmationModal.openConfirmation({
      title: "Delete your account?",
      description:
        "This will permanently delete your account and all your deadlines. This action cannot be undone.",
      confirmLabel: "Yes, delete my account",
      variant: "destructive",
      onConfirm: async () => {
        try {
          const response = await fetch("/api/settings/delete-account", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
          });

          const data = (await response.json()) as { error?: string; success?: boolean };

          if (!response.ok) {
            throw new Error(data.error ?? "Could not delete account");
          }

          router.push("/");
        } catch (error) {
          console.error("[settings/delete-account]", error);
          alert(error instanceof Error ? error.message : "Could not delete account");
        }
      },
    });
  }

  return (
    <SettingsSection title="Delete account" description="">
      <div className="space-y-3">
        <p className="text-sm text-text-muted">
          This will permanently delete your account and all your deadlines. This cannot be undone.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="bg-transparent border border-urgency-todayBorder hover:bg-urgency-today text-urgency-todayText text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          Delete account
        </button>
      </div>
    </SettingsSection>
  );
}
