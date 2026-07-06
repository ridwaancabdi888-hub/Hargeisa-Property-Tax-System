import type { LucideIcon } from "lucide-react";
import type { Delta } from "../../types";

interface StatCardProps {
  label: string;
  value: string;
  delta?: Delta;
  icon: LucideIcon;
}

export default function StatCard({ label, value, delta, icon: Icon }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        <span className="rounded-lg bg-slate-100 p-1.5 text-navy-800">
          <Icon size={16} strokeWidth={2} />
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">{value}</div>
      {delta && (
        <div
          className={`mt-1 text-xs font-medium ${
            delta.direction === "up" ? "text-emerald-600" : "text-red-600"
          }`}
        >
          {delta.direction === "up" ? "▲" : "▼"} {delta.value}
        </div>
      )}
    </div>
  );
}
