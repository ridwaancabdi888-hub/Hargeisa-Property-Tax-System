import { CheckCircle2, XCircle } from "lucide-react";

export type ToastVariant = "success" | "error";

interface ToastProps {
  message: string;
  variant: ToastVariant;
}

const variantClasses: Record<ToastVariant, string> = {
  success: "bg-emerald-600",
  error: "bg-red-600",
};

export default function Toast({ message, variant }: ToastProps) {
  const Icon = variant === "success" ? CheckCircle2 : XCircle;
  return (
    <div
      className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-card ${variantClasses[variant]}`}
    >
      <Icon size={16} />
      {message}
    </div>
  );
}
