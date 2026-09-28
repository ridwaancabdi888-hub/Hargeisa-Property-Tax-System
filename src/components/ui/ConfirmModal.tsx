import { useEffect, useId, useRef } from "react";
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCancelRef = useRef(onCancel);
  const isSubmittingRef = useRef(isSubmitting);
  const titleId = useId();
  const messageId = useId();

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    isSubmittingRef.current = isSubmitting;
  }, [isSubmitting]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const dialog = dialogRef.current;

    const getFocusableElements = () =>
      Array.from(
        dialog?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ) ?? []
      );

    const focusableElements = getFocusableElements();
    (focusableElements[0] ?? dialog)?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (!isSubmittingRef.current) {
          event.preventDefault();
          onCancelRef.current();
        }
        return;
      }

      if (event.key !== "Tab") return;

      const currentFocusableElements = getFocusableElements();
      if (currentFocusableElements.length === 0) {
        event.preventDefault();
        dialog?.focus();
        return;
      }

      const firstElement = currentFocusableElements[0];
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1];

      if (event.shiftKey && (document.activeElement === firstElement || !dialog?.contains(document.activeElement))) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, []);

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
