type BadgeTone = "green" | "red" | "amber" | "blue" | "slate";

const toneClasses: Record<BadgeTone, string> = {
  green: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  red: "bg-red-50 text-red-700 ring-red-600/20",
  amber: "bg-amber-50 text-amber-700 ring-amber-600/20",
  blue: "bg-blue-50 text-blue-700 ring-blue-600/20",
  slate: "bg-slate-100 text-slate-600 ring-slate-500/20",
};

const statusTone: Record<string, BadgeTone> = {
  Paid: "green",
  Active: "green",
  Pending: "amber",
  "Under Review": "amber",
  Overdue: "red",
  Disputed: "red",
};

interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
}

export default function StatusBadge({ status, tone }: StatusBadgeProps) {
  const resolvedTone = tone ?? statusTone[status] ?? "slate";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${toneClasses[resolvedTone]}`}
    >
      {status}
    </span>
  );
}
