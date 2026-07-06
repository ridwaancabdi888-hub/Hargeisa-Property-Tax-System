import { useMemo, useState } from "react";
import { Building2, DollarSign, ClipboardList, Plus, Download, Pencil } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import { districts, properties } from "../data/mockData";
import type { Property } from "../types";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;

const statusOptions = ["All Statuses", "Active", "Under Review", "Disputed"];
const districtOptions = ["All Districts", ...districts.map((d) => d.name)];

const columns: Column<Property>[] = [
  { header: "Property ID", render: (r) => <span className="font-medium text-slate-900">{r.id}</span> },
  { header: "Owner Name", render: (r) => r.owner },
  { header: "District", render: (r) => r.district },
  { header: "Address", render: (r) => r.address },
  { header: "Assessed Value", align: "right", render: (r) => currency(r.assessedValue) },
  { header: "Status", render: (r) => <StatusBadge status={r.status} /> },
  {
    header: "Actions",
    align: "right",
    render: () => (
      <button className="text-slate-400 hover:text-navy-700" aria-label="Edit property">
        <Pencil size={15} />
      </button>
    ),
  },
];

export default function PropertyInventory() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [district, setDistrict] = useState("All Districts");

  const filtered = useMemo(() => {
    return properties.filter((p) => {
      const matchesSearch =
        search.trim() === "" ||
        p.owner.toLowerCase().includes(search.toLowerCase()) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = status === "All Statuses" || p.status === status;
      const matchesDistrict = district === "All Districts" || p.district === district;
      return matchesSearch && matchesStatus && matchesDistrict;
    });
  }, [search, status, district]);

  const totalAssessed = properties.reduce((sum, p) => sum + p.assessedValue, 0);
  const pendingAudits = properties.filter((p) => p.status === "Under Review").length;

  return (
    <div>
      <PageHeader
        title="Property Inventory"
        subtitle="Manage the municipal property register and assessment records"
        action={<Button icon={<Plus size={16} />}>Add Property</Button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Properties" value={properties.length.toLocaleString()} icon={Building2} />
        <StatCard label="Total Assessed Value" value={currency(totalAssessed)} icon={DollarSign} />
        <StatCard label="Pending Audits" value={String(pendingAudits)} icon={ClipboardList} />
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Search by owner or property ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FilterSelect options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
          <FilterSelect options={districtOptions} value={district} onChange={(e) => setDistrict(e.target.value)} />
          <Button variant="secondary" icon={<Download size={15} />}>
            Export CSV
          </Button>
        </div>

        <DataTable columns={columns} rows={filtered} rowKey={(r) => r.id} />
        <p className="mt-3 text-xs text-slate-500">Showing {filtered.length} of {properties.length} properties</p>
      </Card>
    </div>
  );
}
