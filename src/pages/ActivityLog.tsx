import { useCallback, useEffect, useState } from "react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import { listActivityLogs } from "../lib/activityLogApi";
import { useTranslation } from "../lib/i18n/useTranslation";
import { ACTIVITY_ACTIONS, type ActivityLogEntry, type ActivityLogListMeta } from "../types/activityLog";

const actionOptions = ["All Actions", ...ACTIVITY_ACTIONS];

const actionTone: Record<string, "green" | "red" | "amber" | "blue" | "slate"> = {
  login: "green",
  logout: "slate",
  property_created: "green",
  property_updated: "blue",
  property_deleted: "red",
  profile_updated: "amber",
  password_changed: "amber",
};

function formatAction(action: string) {
  return action
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ActivityLog() {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);
  const [meta, setMeta] = useState<ActivityLogListMeta>({ total: 0, totalPages: 1, currentPage: 1, limit: 20 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [action, setAction] = useState("All Actions");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listActivityLogs({
        page,
        limit: 20,
        search: search || undefined,
        action: action === "All Actions" ? undefined : action,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      });
      setLogs(res.data);
      setMeta(res.meta);
    } catch {
      setError("Failed to load activity logs. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, action, dateFrom, dateTo]);

  useEffect(() => {
    const timeout = setTimeout(fetchLogs, 300);
    return () => clearTimeout(timeout);
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, action, dateFrom, dateTo]);

  const columns: Column<ActivityLogEntry>[] = [
    { header: "Timestamp", render: (r) => new Date(r.createdAt).toLocaleString() },
    { header: "User", render: (r) => r.userFullName ?? r.userUsername ?? "System" },
    {
      header: "Action",
      render: (r) => <StatusBadge status={formatAction(r.action)} tone={actionTone[r.action] ?? "slate"} />,
    },
    { header: "Description", render: (r) => r.description },
    { header: "IP Address", render: (r) => r.ipAddress ?? "—" },
  ];

  return (
    <div>
      <PageHeader title={t.pages.activityLog.title} subtitle={t.pages.activityLog.subtitle} />

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            placeholder="Search by description or user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FilterSelect options={actionOptions} value={action} onChange={(e) => setAction(e.target.value)} />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 lg:w-40"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 lg:w-40"
          />
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

        {isLoading ? (
          <TableSkeleton rows={8} columns={5} />
        ) : logs.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">No activity matches your filters.</p>
        ) : (
          <DataTable columns={columns} rows={logs} rowKey={(r) => String(r.id)} />
        )}

        <div className="mt-4">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </Card>
    </div>
  );
}
