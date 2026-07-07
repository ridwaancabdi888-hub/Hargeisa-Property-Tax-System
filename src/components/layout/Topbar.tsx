import { Menu, RefreshCw } from "lucide-react";
import NotificationsDropdown from "./NotificationsDropdown";

interface TopbarProps {
  onMenuClick: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <div className="flex items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 py-2.5 sm:px-6 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex min-w-0 items-center gap-2">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onMenuClick}
          className="shrink-0 text-slate-500 hover:text-slate-700 lg:hidden dark:text-slate-400 dark:hover:text-slate-200"
        >
          <Menu size={20} />
        </button>
        <span className="hidden shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline-block dark:bg-slate-700 dark:text-slate-300">
          Hargeisa District Portal
        </span>
        <span className="hidden shrink-0 truncate rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 md:inline-block dark:bg-slate-700 dark:text-slate-300">
          Governing District: Marodi Jeex
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-3 sm:gap-4">
        <button type="button" className="hidden items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 sm:flex dark:text-slate-400 dark:hover:text-slate-200">
          <RefreshCw size={13} />
          Synced just now
        </button>
        <NotificationsDropdown />
      </div>
    </div>
  );
}
