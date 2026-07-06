import { Search } from "lucide-react";
import type { InputHTMLAttributes } from "react";

export default function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="relative flex-1">
      <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
        {...props}
      />
    </div>
  );
}
