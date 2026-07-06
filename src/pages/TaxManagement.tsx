import { DollarSign, CheckCircle2, Percent, Gavel, Filter, Receipt } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { taxRecords } from "../data/mockData";
import type { TaxRecord } from "../types";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const columns: Column<TaxRecord>[] = [
  { header: "Property ID", render: (r) => <span className="font-medium text-slate-900">{r.propertyId}</span> },
  { header: "Owner Name", render: (r) => r.owner },
  { header: "Due Date", render: (r) => r.dueDate },
  { header: "Tax Amount", align: "right", render: (r) => currency(r.amount) },
  { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  {
    header: "Actions",
    align: "right",
    render: () => (
      <button className="text-xs font-medium text-navy-700 hover:underline">View</button>
    ),
  },
];

export default function TaxManagement() {
  const totalOutstanding = taxRecords
    .filter((r) => r.status !== "Paid")
    .reduce((sum, r) => sum + r.amount, 0);
  const totalPaid = taxRecords.filter((r) => r.status === "Paid").reduce((sum, r) => sum + r.amount, 0);
  const complianceRate = Math.round((taxRecords.filter((r) => r.status === "Paid").length / taxRecords.length) * 100);

  return (
    <div>
      <PageHeader
        title="Tax Management"
        subtitle="Comprehensive tax processing tools and compliance overview"
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={<Filter size={15} />}>Filter</Button>
            <Button icon={<Receipt size={15} />}>Generate Tax Bill</Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Outstanding" value={currency(totalOutstanding)} icon={DollarSign} />
        <StatCard label="Amount Paid YTD" value={currency(totalPaid)} icon={CheckCircle2} />
        <StatCard label="Compliance Rate" value={`${complianceRate}%`} icon={Percent} />
        <StatCard label="Pending Appeals" value="142" icon={Gavel} />
      </div>

      <Card title="Payment History" subtitle="Recent and upcoming tax obligations" className="mt-6">
        <DataTable columns={columns} rows={taxRecords} rowKey={(r) => r.id} />
      </Card>
    </div>
  );
}
