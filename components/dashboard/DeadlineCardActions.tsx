"use client";

import { useConfirmation } from "@/contexts/ConfirmationModalContext";

interface DeadlineCardActionsProps {
  id: string;
  isDone: boolean;
  isOverdue: boolean;
  onDoneClick?: (id: string) => Promise<void>;
  onUndo?: (id: string) => Promise<void>;
}

const CheckmarkIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="2 6 5 9 10 3" />
  </svg>
);

const UndoIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 4h6a4 4 0 0 1 0 8" />
    <polyline points="1 4 4 1 1 1" />
  </svg>
);

export default function DeadlineCardActions({
  id,
  isDone,
  isOverdue,
  onDoneClick,
  onUndo,
}: DeadlineCardActionsProps): React.ReactElement {
  const { openConfirmation } = useConfirmation();

  const handleMarkAsSubmitted = () => {
    if (!onDoneClick) return;

    openConfirmation({
      title: "Mark as submitted?",
      description:
        "This will stop all reminders for this deadline. You can undo this anytime.",
      confirmLabel: "Yes, mark as submitted",
      cancelLabel: "Cancel",
      variant: "default",
      onConfirm: async () => {
        await onDoneClick(id);
      },
    });
  };

  const handleRemoveSubmission = () => {
    if (!onUndo) return;

    openConfirmation({
      title: "Remove submission?",
      description:
        "This will restore the deadline and resume reminders if it hasn't passed yet.",
      confirmLabel: "Yes, remove",
      cancelLabel: "Cancel",
      variant: "destructive",
      onConfirm: async () => {
        await onUndo(id);
      },
    });
  };

  // Done deadlines - show "Submitted" status + "Undo" button
  if (isDone) {
    return (
      <div className="flex justify-end gap-2 mt-3">
        <div className="flex items-center gap-1.5 bg-urgency-done border border-urgency-doneBorder text-urgency-doneText text-xs font-medium px-3 py-1.5 rounded-lg cursor-default">
          <CheckmarkIcon />
          Submitted
        </div>
        <button
          onClick={handleRemoveSubmission}
          className="flex items-center gap-1.5 bg-urgency-today border border-urgency-todayBorder text-urgency-todayText hover:opacity-80 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity"
        >
          <UndoIcon />
          Undo
        </button>
      </div>
    );
  }

  // Active or overdue deadlines - show "Mark as submitted" button
  const buttonClass = isOverdue
    ? "flex items-center gap-1.5 bg-urgency-done border border-urgency-doneBorder text-urgency-doneText hover:opacity-80 text-xs font-medium px-3 py-1.5 rounded-lg transition-opacity"
    : "flex items-center gap-1.5 bg-brand-light border border-brand/40 text-brand hover:bg-brand hover:text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors";

  return (
    <div className="flex justify-end mt-3">
      <button onClick={handleMarkAsSubmitted} className={buttonClass}>
        <CheckmarkIcon />
        Mark as submitted
      </button>
    </div>
  );
}
