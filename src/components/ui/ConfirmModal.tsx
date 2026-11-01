import { useId } from "react";
import { AlertTriangle } from "lucide-react";
import Button from "./Button";
import useModalFocusTrap from "./useModalFocusTrap";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel?: string;
  isSubmitting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Delete",
  isSubmitting = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const dialogRef = useModalFocusTrap({ onClose: onCancel, canClose: !isSubmitting });
  const titleId = useId();
  const messageId = useId();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={messageId}
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card dark:bg-slate-800"
      >
        <span
          aria-hidden="true"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600"
        >
          <AlertTriangle size={18} />
        </span>
        <h2 id={titleId} className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h2>
        <p id={messageId} className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message}
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Deleting..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
