import { useCallback, useEffect, useState } from "react";
import { DollarSign, Building2, Percent, CheckCircle2, Filter as FilterIcon, Receipt } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import Skeleton from "../components/ui/Skeleton";
import { getPropertyCounts, getTaxBillUrl, listProperties } from "../lib/propertiesApi";
import { useTranslation } from "../lib/i18n/useTranslation";
import type { PropertyListMeta, PropertyListing } from "../types/property";

// Illustrative flat municipal tax rate, matching TAX_RATE in
// server/src/controllers/propertyController.js. Used here only to preview
// the amount that will appear on the generated bill.
const TAX_RATE = 0.01;

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const statusOptions = ["All Statuses", "available", "sold", "rented"];
const typeOptions = ["All Types", "rent", "sale"];
const statusTone = { available: "green", rented: "amber", sold: "slate" } as const;

export default function TaxManagement() {
  const { t } = useTranslation();
  const statusLabel = { available: t.common.available, sold: t.common.sold, rented: t.common.rented };
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [meta, setMeta] = useState<PropertyListMeta>({ total: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [type, setType] = useState("All Types");
  const [page, setPage] = useState(1);

  const [totals, setTotals] = useState<{ total: number; assessedValue: number; sold: number } | null>(null);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listProperties({
        page,
        limit: 10,
        search: search || undefined,
        status: status === "All Statuses" ? undefined : (status as PropertyListing["status"]),
        type: type === "All Types" ? undefined : (type as PropertyListing["type"]),
      });
      setProperties(res.data);
      setMeta(res.meta);
    } catch {
      setError("Failed to load properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, status, type]);

  useEffect(() => {
    const timeout = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timeout);
  }, [fetchProperties]);

  useEffect(() => {
    setPage(1);
  }, [search, status, type]);

  useEffect(() => {
    getPropertyCounts().then((res) => {
      setTotals({ total: res.data.total, assessedValue: res.data.assessedValue, sold: res.data.sold });
    });
  }, [properties]);

  const columns: Column<PropertyListing>[] = [
    { header: t.common.title, render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
    { header: t.common.location, render: (r) => r.location },
    { header: t.common.price, align: "right", render: (r) => currency(r.price) },
    { header: "Est. Tax", align: "right", render: (r) => currency(r.price * TAX_RATE) },
    { header: t.common.status, render: (r) => <StatusBadge status={statusLabel[r.status]} tone={statusTone[r.status]} /> },
    {
      header: t.common.actions,
      align: "right",
      render: (r) => (
        <a href={getTaxBillUrl(r.id)} className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-700 hover:underline">
          <Receipt size={13} /> {t.pages.taxManagement.generateBill}
        </a>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.pages.taxManagement.title}
        subtitle={t.pages.taxManagement.subtitle}
        action={
          <Button variant="secondary" icon={<FilterIcon size={15} />} onClick={() => setShowFilters((v) => !v)}>
            {t.common.filter}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {totals ? (
          <>
            <StatCard label={t.pages.taxManagement.totalProperties} value={String(totals.total)} icon={Building2} />
            <StatCard label={t.pages.taxManagement.totalAssessedValue} value={currency(totals.assessedValue)} icon={DollarSign} />
            <StatCard label={t.pages.taxManagement.estimatedTaxLevied} value={currency(totals.assessedValue * TAX_RATE)} icon={Percent} />
          </>
        ) : (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>

      <Card
        title={t.pages.taxManagement.propertyTaxRoll}
        subtitle={`Generate a per-property tax bill at a flat illustrative rate of ${(TAX_RATE * 100).toFixed(1)}%`}
        className="mt-6"
      >
        {showFilters && (
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput placeholder="Search by title or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <FilterSelect className="capitalize" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
            <FilterSelect className="capitalize" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
          </div>
        )}

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

        {isLoading ? (
          <TableSkeleton rows={6} columns={6} />
        ) : properties.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">{t.common.noResults}</p>
        ) : (
          <DataTable columns={columns} rows={properties} rowKey={(r) => String(r.id)} />
        )}

        <div className="mt-4">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </Card>

      {totals && totals.sold > 0 && (
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <CheckCircle2 size={13} className="text-emerald-600" /> {totals.sold} propert{totals.sold === 1 ? "y" : "ies"} marked sold this period.
        </p>
      )}
    </div>
  );
}
