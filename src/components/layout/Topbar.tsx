import { RefreshCw } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

export default function Topbar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-2.5 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center gap-2">
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          Hargeisa District Portal
        </span>
        <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
          Governing District: Marodi Jeex
        </span>
      </div>
      <div className="flex items-center gap-4">
        <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          <RefreshCw size={13} />
          Synced just now
        </button>
        <NotificationsDropdown />
      </div>
    </div>
  );
}
