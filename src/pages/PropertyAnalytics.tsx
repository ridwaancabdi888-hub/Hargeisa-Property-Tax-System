import { useEffect, useState } from "react";
import {
  Bar,
  BarChart as RBarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Building2, CheckCircle2, DollarSign, FileDown, Key, Tag } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import { getAnalyticsOverview } from "../lib/analyticsApi";
import type { AnalyticsOverview } from "../types/analytics";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const STATUS_COLORS: Record<string, string> = {
  available: "#10b981",
  rented: "#f59e0b",
  sold: "#94a3b8",
};

const TYPE_COLORS: Record<string, string> = {
  rent: "#64748b",
  sale: "#3b82f6",
};

export default function PropertyAnalytics() {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnalyticsOverview()
      .then((res) => setOverview(res.data))
      .catch(() => setError("Failed to load analytics. Please try again."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Analytics" subtitle="Portfolio performance across all property listings" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <Skeleton className="mt-4 h-64" />
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
        {error ?? "No analytics available."}
      </div>
    );
  }

  const statusData = [
    { status: "Available", count: overview.totals.available },
    { status: "Sold", count: overview.totals.sold },
    { status: "Rented", count: overview.totals.rented },
  ];

  const pieData = overview.byType.map((t) => ({ name: t.type === "sale" ? "Sale" : "Rent", value: t.count, key: t.type }));

  return (
    <div>
      <PageHeader
        title="Analytics"
        subtitle="Portfolio performance across all property listings"
        action={
          <a href="/api/analytics/export/pdf">
            <Button variant="secondary" icon={<FileDown size={15} />}>
              Export PDF
            </Button>
          </a>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total Properties" value={String(overview.totals.total)} icon={Building2} />
        <StatCard label="Available" value={String(overview.totals.available)} icon={Tag} />
        <StatCard label="Sold" value={String(overview.totals.sold)} icon={CheckCircle2} />
        <StatCard label="Rented" value={String(overview.totals.rented)} icon={Key} />
        <StatCard label="Realized Revenue" value={currency(overview.revenue)} icon={DollarSign} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card title="Properties by Status" subtitle="Current portfolio breakdown">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RBarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="status" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusData.map((entry) => (
                    <Cell key={entry.status} fill={STATUS_COLORS[entry.status.toLowerCase()]} />
                  ))}
                </Bar>
              </RBarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Rent vs Sale" subtitle="Distribution by listing type">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={TYPE_COLORS[entry.key]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="Monthly Creation Trend" subtitle="New listings over the last 12 months" className="mt-4">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overview.monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#132a49" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {overview.monthlyTrend.length === 0 && (
          <p className="py-4 text-center text-sm text-slate-500">No properties created in the last 12 months yet.</p>
        )}
      </Card>
    </div>
  );
}
