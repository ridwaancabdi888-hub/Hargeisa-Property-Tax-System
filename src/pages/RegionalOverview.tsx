import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Building2, CheckCircle2, Key, Tag, FileDown } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import BarChart from "../components/ui/BarChart";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCsvExportUrl, getPropertyCounts, listProperties } from "../lib/propertiesApi";
import { useTranslation } from "../lib/i18n/useTranslation";
import type { PropertyCounts, PropertyListing } from "../types/property";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const statusTone = { available: "green", rented: "amber", sold: "slate" } as const;

export default function RegionalOverview() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [counts, setCounts] = useState<PropertyCounts | null>(null);
  const [recent, setRecent] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typeLabel = { rent: t.common.rent, sale: t.common.sale };
  const statusLabel = { available: t.common.available, sold: t.common.sold, rented: t.common.rented };

  const columns: Column<PropertyListing>[] = [
    { header: t.common.title, render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
    { header: t.common.location, render: (r) => r.location },
    { header: t.common.price, align: "right", render: (r) => currency(r.price) },
    { header: t.common.type, render: (r) => <StatusBadge status={typeLabel[r.type]} tone={r.type === "sale" ? "blue" : "slate"} /> },
    { header: t.common.status, render: (r) => <StatusBadge status={statusLabel[r.status]} tone={statusTone[r.status]} /> },
    { header: t.common.added, render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  useEffect(() => {
    Promise.all([getPropertyCounts(), listProperties({ limit: 8 })])
      .then(([countsRes, recentRes]) => {
        setCounts(countsRes.data);
        setRecent(recentRes.data);
      })
      .catch(() => setError("Failed to load portfolio overview. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title={t.pages.dashboard.title} subtitle={t.pages.dashboard.subtitle} />

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

      {isLoading || !counts ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label={t.pages.dashboard.totalProperties} value={String(counts.total)} icon={Building2} />
          <StatCard label={t.pages.dashboard.available} value={String(counts.available)} icon={Tag} />
          <StatCard label={t.pages.dashboard.sold} value={String(counts.sold)} icon={CheckCircle2} />
          <StatCard label={t.pages.dashboard.rented} value={String(counts.rented)} icon={Key} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title={t.pages.dashboard.propertiesByType} subtitle={t.pages.dashboard.propertiesByTypeSubtitle} className="lg:col-span-2">
          {counts && (
            <BarChart
              data={[
                { label: t.common.rent, value: counts.rent },
                { label: t.common.sale, value: counts.sale },
              ]}
            />
          )}
        </Card>

        <Card title={t.pages.dashboard.recentlyAdded} action={<button className="text-xs font-medium text-navy-700 hover:underline" onClick={() => navigate("/property-listings")}>{t.common.viewAll}</button>}>
          <ul className="divide-y divide-slate-100">
            {recent.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{p.title}</p>
                  <p className="text-xs text-slate-500">{p.location} &middot; {new Date(p.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{currency(p.price)}</span>
              </li>
            ))}
            {recent.length === 0 && !isLoading && <p className="py-4 text-center text-sm text-slate-500">{t.pages.dashboard.noPropertiesYet}</p>}
          </ul>
        </Card>
      </div>

      <Card
        title={t.pages.dashboard.recentlyAddedListings}
        subtitle={t.pages.dashboard.recentlyAddedListingsSubtitle}
        className="mt-4"
        action={
          <a href={getCsvExportUrl({})}>
            <Button variant="secondary" icon={<FileDown size={15} />}>
              {t.pages.dashboard.exportReport}
            </Button>
          </a>
        }
      >
        {isLoading ? (
          <Skeleton className="h-48" />
        ) : (
          <DataTable columns={columns} rows={recent} rowKey={(r) => String(r.id)} />
        )}
      </Card>
    </div>
  );
}
