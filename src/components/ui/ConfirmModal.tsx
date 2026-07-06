import { AlertTriangle } from "lucide-react";
import Button from "./Button";

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
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card dark:bg-slate-800">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={18} />
        </span>
        <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{message}</p>
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
