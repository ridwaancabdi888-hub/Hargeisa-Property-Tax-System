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
import type { PropertyCounts, PropertyListing } from "../types/property";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const statusTone = { available: "green", rented: "amber", sold: "slate" } as const;

const columns: Column<PropertyListing>[] = [
  { header: "Title", render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
  { header: "Location", render: (r) => r.location },
  { header: "Price", align: "right", render: (r) => currency(r.price) },
  { header: "Type", render: (r) => <StatusBadge status={capitalize(r.type)} tone={r.type === "sale" ? "blue" : "slate"} /> },
  { header: "Status", render: (r) => <StatusBadge status={capitalize(r.status)} tone={statusTone[r.status]} /> },
  { header: "Added", render: (r) => new Date(r.createdAt).toLocaleDateString() },
];

export default function RegionalOverview() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState<PropertyCounts | null>(null);
  const [recent, setRecent] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      <PageHeader title="Regional Overview" subtitle="Consolidated property portfolio performance across Hargeisa" />

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

      {isLoading || !counts ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Properties" value={String(counts.total)} icon={Building2} />
          <StatCard label="Available" value={String(counts.available)} icon={Tag} />
          <StatCard label="Sold" value={String(counts.sold)} icon={CheckCircle2} />
          <StatCard label="Rented" value={String(counts.rented)} icon={Key} />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Properties by Listing Type" subtitle="Rent vs. sale composition" className="lg:col-span-2">
          {counts && (
            <BarChart
              data={[
                { label: "Rent", value: counts.rent },
                { label: "Sale", value: counts.sale },
              ]}
            />
          )}
        </Card>

        <Card title="Recently Added" action={<button className="text-xs font-medium text-navy-700 hover:underline" onClick={() => navigate("/property-listings")}>View all</button>}>
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
            {recent.length === 0 && !isLoading && <p className="py-4 text-center text-sm text-slate-500">No properties yet.</p>}
          </ul>
        </Card>
      </div>

      <Card
        title="Recently Added Listings"
        subtitle="Newest properties added to the portfolio"
        className="mt-4"
        action={
          <a href={getCsvExportUrl({})}>
            <Button variant="secondary" icon={<FileDown size={15} />}>
              Export Report
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
