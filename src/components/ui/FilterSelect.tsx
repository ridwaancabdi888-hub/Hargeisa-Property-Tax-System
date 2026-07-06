import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes } from "react";

interface FilterSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: string[];
}

export default function FilterSelect({ options, className = "", ...rest }: FilterSelectProps) {
  return (
    <div className="relative">
      <select
        className={`appearance-none rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-8 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
