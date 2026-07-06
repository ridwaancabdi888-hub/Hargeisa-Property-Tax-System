import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PropertyListMeta } from "../../types/property";

interface PaginationProps {
  meta: PropertyListMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  const { total, totalPages, currentPage, limit } = meta;
  const start = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const end = Math.min(currentPage * limit, total);

  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
      <p>
        Showing {start}-{end} of {total}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          <ChevronLeft size={14} /> Prev
        </button>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 disabled:cursor-not-allowed disabled:opacity-40 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Next <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
