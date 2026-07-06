import { Building2, CheckCircle2, AlertTriangle, DollarSign, Send } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import BarChart from "../components/ui/BarChart";
import DataTable, { type Column } from "../components/ui/DataTable";
import Button from "../components/ui/Button";
import { delinquentList, monthlyCollectionTrend, recentCollections } from "../data/mockData";
import type { DelinquentEntry } from "../types";

const currency = (n: number) =>
  `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const columns: Column<DelinquentEntry>[] = [
  { header: "Property ID", render: (r) => <span className="font-medium text-slate-900">{r.propertyId}</span> },
  { header: "Owner Name", render: (r) => r.owner },
  { header: "District", render: (r) => r.district },
  { header: "Last Assessed", render: (r) => r.lastAssessed },
  { header: "Balance Due", align: "right", render: (r) => <span className="font-medium text-red-600">{currency(r.balanceDue)}</span> },
  {
    header: "Action",
    align: "right",
    render: () => (
      <button className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-700 hover:underline">
        <Send size={12} /> Send Notice
      </button>
    ),
  },
];

export default function RegionalOverview() {
  return (
    <div>
      <PageHeader title="Regional Overview" subtitle="Consolidated tax collection performance across all Hargeisa districts" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Properties" value="30,423" icon={Building2} delta={{ value: "3.2% vs last year", direction: "up" }} />
        <StatCard label="Fully Paid YTD" value="28,443" icon={CheckCircle2} delta={{ value: "1.8% vs last year", direction: "up" }} />
        <StatCard label="Overdue Amount" value="14,440" icon={AlertTriangle} delta={{ value: "2.1% vs last year", direction: "down" }} />
        <StatCard label="Total Revenue" value="$3.2M" icon={DollarSign} delta={{ value: "6.4% vs last year", direction: "up" }} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card title="Monthly Collection Trend" subtitle="Fiscal year 2025" className="lg:col-span-2">
          <BarChart data={monthlyCollectionTrend.map((m) => ({ label: m.month, value: m.amount }))} highlightLabel="Nov" formatValue={currency} />
        </Card>

        <Card title="Recent Collections" action={<button className="text-xs font-medium text-navy-700 hover:underline">View all</button>}>
          <ul className="divide-y divide-slate-100">
            {recentCollections.map((c) => (
              <li key={c.propertyId} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-800">{c.owner}</p>
                  <p className="text-xs text-slate-500">{c.propertyId} &middot; {c.date}</p>
                </div>
                <span className="text-sm font-semibold text-emerald-600">{currency(c.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title="Priority Delinquent List" subtitle="Properties with the highest outstanding balances" className="mt-4" action={<Button variant="secondary">Export Report</Button>}>
        <DataTable columns={columns} rows={delinquentList} rowKey={(r) => r.propertyId} />
      </Card>
    </div>
  );
}
