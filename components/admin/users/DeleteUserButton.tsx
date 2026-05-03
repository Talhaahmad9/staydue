"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { useConfirmation } from "@/contexts/ConfirmationModalContext";

interface Props {
  userId: string;
  userName: string;
}

export default function DeleteUserButton({ userId, userName }: Props) {
  const router = useRouter();
  const { openConfirmation } = useConfirmation();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    openConfirmation({
      title: "Delete user",
      description: `This will permanently delete ${userName} and all their deadlines, subscriptions, and notification history. This cannot be undone.`,
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
        if (!res.ok) {
          const data = (await res.json()) as { error?: string };
          throw new Error(data.error ?? "Failed to delete user");
        }
        router.refresh();
      },
    });
  }

  return (
    <button
      onClick={handleClick}
      className="p-1.5 rounded-md text-text-muted hover:text-urgency-todayText hover:bg-urgency-today/10 transition-colors"
      aria-label={`Delete ${userName}`}
    >
      <Trash2 size={14} />
    </button>
  );
}
