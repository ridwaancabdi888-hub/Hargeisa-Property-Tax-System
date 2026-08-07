import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building2, CheckCircle2, Key, Tag, FileDown, ImageOff, type LucideIcon } from "lucide-react";
import Card from "../components/ui/Card";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getCsvExportUrl, getPropertyCounts, listProperties } from "../lib/propertiesApi";
import { useTranslation } from "../lib/i18n/useTranslation";
import type { PropertyCounts, PropertyListing } from "../types/property";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const statusTone = { available: "green", rented: "amber", sold: "slate" } as const;

function computeMonthlyTrend(properties: PropertyListing[]) {
  const now = new Date();
  const buckets: { key: string; month: string; count: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({ key: `${d.getFullYear()}-${d.getMonth()}`, month: d.toLocaleDateString("en-US", { month: "short" }), count: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const p of properties) {
    const d = new Date(p.createdAt);
    const bucket = byKey.get(`${d.getFullYear()}-${d.getMonth()}`);
    if (bucket) bucket.count += 1;
  }
  return buckets.map(({ month, count }) => ({ month, count }));
}

const sparkColorByTone: Record<string, string> = {
  primary: "#3b82f6",
  emerald: "#10b981",
  slate: "#64748b",
  amber: "#f59e0b",
};

export default function RegionalOverview() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [counts, setCounts] = useState<PropertyCounts | null>(null);
  const [recent, setRecent] = useState<PropertyListing[]>([]);
  const [trendSource, setTrendSource] = useState<PropertyListing[]>([]);
  const [saleShowcase, setSaleShowcase] = useState<PropertyListing[]>([]);
  const [rentShowcase, setRentShowcase] = useState<PropertyListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const typeLabel = { rent: t.common.rent, sale: t.common.sale };
  const statusLabel = { available: t.common.available, sold: t.common.sold, rented: t.common.rented };

  const monthlyTrend = useMemo(() => computeMonthlyTrend(trendSource), [trendSource]);
  const availableTrend = useMemo(() => computeMonthlyTrend(trendSource.filter((p) => p.status === "available")), [trendSource]);
  const soldTrend = useMemo(() => computeMonthlyTrend(trendSource.filter((p) => p.status === "sold")), [trendSource]);
  const rentedTrend = useMemo(() => computeMonthlyTrend(trendSource.filter((p) => p.status === "rented")), [trendSource]);

  const columns: Column<PropertyListing>[] = [
    { header: t.common.title, render: (r) => <span className="font-medium text-slate-900 dark:text-slate-100">{r.title}</span> },
    { header: t.common.location, render: (r) => r.location },
    { header: t.common.price, align: "right", render: (r) => currency(r.price) },
    { header: t.common.type, render: (r) => <StatusBadge status={typeLabel[r.type]} tone={r.type === "sale" ? "blue" : "slate"} /> },
    { header: t.common.status, render: (r) => <StatusBadge status={statusLabel[r.status]} tone={statusTone[r.status]} /> },
    { header: t.common.added, render: (r) => new Date(r.createdAt).toLocaleDateString() },
  ];

  useEffect(() => {
    Promise.all([
      getPropertyCounts(),
      listProperties({ limit: 8 }),
      listProperties({ limit: 100 }),
      listProperties({ type: "sale", limit: 4 }),
      listProperties({ type: "rent", limit: 4 }),
    ])
      .then(([countsRes, recentRes, trendRes, saleRes, rentRes]) => {
        setCounts(countsRes.data);
        setRecent(recentRes.data);
        setTrendSource(trendRes.data);
        setSaleShowcase(saleRes.data);
        setRentShowcase(rentRes.data);
      })
      .catch(() => setError("Failed to load portfolio overview. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  const totalForRatio = counts?.total || 1;

  return (
    <div className="relative">
      <div className="pointer-events-none absolute -top-16 right-0 -z-10 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl dark:bg-blue-500/10" />
      <div className="pointer-events-none absolute -top-8 left-1/3 -z-10 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl dark:bg-emerald-500/10" />

      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white">{t.pages.dashboard.title}</h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-400">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{t.pages.dashboard.subtitle}</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

      {isLoading || !counts ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <PremiumStatCard
            icon={Building2}
            label={t.pages.dashboard.totalProperties}
            value={String(counts.total)}
            tone="primary"
            trend={monthlyTrend}
          />
          <PremiumStatCard
            icon={Tag}
            label={t.pages.dashboard.available}
            value={String(counts.available)}
            tone="emerald"
            ratioLabel={`${Math.round((counts.available / totalForRatio) * 100)}%`}
            trend={availableTrend}
          />
          <PremiumStatCard
            icon={CheckCircle2}
            label={t.pages.dashboard.sold}
            value={String(counts.sold)}
            tone="slate"
            ratioLabel={`${Math.round((counts.sold / totalForRatio) * 100)}%`}
            trend={soldTrend}
          />
          <PremiumStatCard
            icon={Key}
            label={t.pages.dashboard.rented}
            value={String(counts.rented)}
            tone="amber"
            ratioLabel={`${Math.round((counts.rented / totalForRatio) * 100)}%`}
            trend={rentedTrend}
          />
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card
          title={t.pages.dashboard.propertiesByType}
          subtitle={t.pages.dashboard.propertiesByTypeSubtitle}
          className="!rounded-3xl !shadow-premium lg:col-span-2"
        >
          {!isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <PropertyPhotoGroup label={t.common.sale} tone="blue" properties={saleShowcase} onSeeAll={() => navigate("/property-listings")} viewAllLabel={t.common.viewAll} />
              <PropertyPhotoGroup label={t.common.rent} tone="slate" properties={rentShowcase} onSeeAll={() => navigate("/property-listings")} viewAllLabel={t.common.viewAll} />
            </div>
          )}

          {counts && (
            <div className="mt-6">
              <ListingSplitBar rent={counts.rent} sale={counts.sale} rentLabel={t.common.rent} saleLabel={t.common.sale} />

              <div className="mt-6 h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrend} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.25} vertical={false} />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={28} />
                    <Tooltip />
                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5} fill="url(#growthGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-1 text-center text-[11px] text-slate-400">New listings over the last 6 months</p>
            </div>
          )}
        </Card>

        <Card
          title={t.pages.dashboard.recentlyAdded}
          className="!rounded-3xl !shadow-premium"
          action={<button className="text-xs font-medium text-navy-700 hover:underline dark:text-navy-500" onClick={() => navigate("/property-listings")}>{t.common.viewAll}</button>}
        >
          <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {recent.slice(0, 5).map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{p.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{p.location} &middot; {new Date(p.createdAt).toLocaleDateString()}</p>
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
        className="!rounded-3xl !shadow-premium mt-4"
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

const statCardTone: Record<string, { iconBg: string; iconText: string; pillBg: string; pillText: string }> = {
  primary: {
    iconBg: "bg-navy-800/10 dark:bg-white/10",
    iconText: "text-navy-800 dark:text-white",
    pillBg: "bg-navy-800/5 dark:bg-white/10",
    pillText: "text-navy-800 dark:text-white",
  },
  emerald: { iconBg: "bg-emerald-50 dark:bg-emerald-500/15", iconText: "text-emerald-600 dark:text-emerald-400", pillBg: "bg-emerald-50 dark:bg-emerald-500/15", pillText: "text-emerald-600 dark:text-emerald-400" },
  slate: { iconBg: "bg-slate-100 dark:bg-slate-600/40", iconText: "text-slate-600 dark:text-slate-300", pillBg: "bg-slate-100 dark:bg-slate-600/40", pillText: "text-slate-600 dark:text-slate-300" },
  amber: { iconBg: "bg-amber-50 dark:bg-amber-500/15", iconText: "text-amber-600 dark:text-amber-400", pillBg: "bg-amber-50 dark:bg-amber-500/15", pillText: "text-amber-600 dark:text-amber-400" },
};

interface PremiumStatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  tone: "primary" | "emerald" | "slate" | "amber";
  ratioLabel?: string;
  trend: { month: string; count: number }[];
}

function PremiumStatCard({ icon: Icon, label, value, tone, ratioLabel, trend }: PremiumStatCardProps) {
  const c = statCardTone[tone];
  const sparkColor = sparkColorByTone[tone];
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-5 shadow-premium transition-all duration-300 hover:-translate-y-1 dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${c.iconBg} ${c.iconText}`}>
          <Icon size={18} strokeWidth={2} />
        </span>
        {ratioLabel && (
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${c.pillBg} ${c.pillText}`}>{ratioLabel} of total</span>
        )}
      </div>
      <p className="mt-4 text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
      <div className="mt-3 h-10 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`spark-${tone}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={sparkColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={sparkColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="count" stroke={sparkColor} strokeWidth={1.75} fill={`url(#spark-${tone})`} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface ListingSplitBarProps {
  rent: number;
  sale: number;
  rentLabel: string;
  saleLabel: string;
}

function ListingSplitBar({ rent, sale, rentLabel, saleLabel }: ListingSplitBarProps) {
  const total = rent + sale || 1;
  const salePct = Math.round((sale / total) * 100);
  const rentPct = 100 - salePct;
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
        <div className="h-full bg-navy-800" style={{ width: `${salePct}%` }} />
        <div className="h-full bg-blue-200" style={{ width: `${rentPct}%` }} />
      </div>
      <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-navy-800" /> {saleLabel}: <strong>{sale}</strong> ({salePct}%)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-blue-200" /> {rentLabel}: <strong>{rent}</strong> ({rentPct}%)
        </span>
      </div>
    </div>
  );
}

interface PropertyPhotoGroupProps {
  label: string;
  tone: "blue" | "slate";
  properties: PropertyListing[];
  onSeeAll: () => void;
  viewAllLabel: string;
}

function PropertyPhotoGroup({ label, tone, properties, onSeeAll, viewAllLabel }: PropertyPhotoGroupProps) {
  const ring = tone === "blue" ? "ring-blue-100" : "ring-slate-200";
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <StatusBadge status={label} tone={tone} />
        <button type="button" className="text-xs font-medium text-navy-700 hover:underline dark:text-navy-500" onClick={onSeeAll}>
          {viewAllLabel}
        </button>
      </div>
      {properties.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 py-6 text-center text-xs text-slate-400 dark:border-slate-700">
          No {label.toLowerCase()} listings with photos yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {properties.map((p) => (
            <div key={p.id} className={`group/photo overflow-hidden rounded-2xl ring-1 transition-transform duration-300 hover:-translate-y-0.5 ${ring}`}>
              <div className="aspect-video w-full overflow-hidden bg-slate-100">
                {p.coverImageUrl ? (
                  <img
                    src={p.coverImageUrl}
                    alt={p.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover/photo:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <ImageOff size={20} />
                  </div>
                )}
              </div>
              <div className="bg-white px-2.5 py-2 dark:bg-slate-800">
                <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-200">{p.title}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{p.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
