import { useCallback, useEffect, useState } from "react";
import { Building2, Tag, Key, Plus, Download, Pencil } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import StatCard from "../components/ui/StatCard";
import Card from "../components/ui/Card";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import { TableSkeleton } from "../components/ui/Skeleton";
import PropertyFormModal from "../components/properties/PropertyFormModal";
import { createProperty, getCsvExportUrl, getProperty, getPropertyCounts, listProperties, updateProperty } from "../lib/propertiesApi";
import type { PropertyDetail, PropertyFormValues, PropertyListMeta, PropertyListing } from "../types/property";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const statusOptions = ["All Statuses", "available", "sold", "rented"];
const typeOptions = ["All Types", "rent", "sale"];
const statusTone = { available: "green", rented: "amber", sold: "slate" } as const;

export default function PropertyInventory() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canEdit = user?.role === "admin" || user?.role === "agent";

  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [meta, setMeta] = useState<PropertyListMeta>({ total: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [counts, setCounts] = useState({ total: 0, available: 0, rented: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All Statuses");
  const [type, setType] = useState("All Types");
  const [page, setPage] = useState(1);

  const [editingProperty, setEditingProperty] = useState<PropertyDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);

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
      setCounts({ total: res.data.total, available: res.data.available, rented: res.data.rented });
    });
  }, [properties]);

  async function handleCreate(values: PropertyFormValues) {
    const res = await createProperty(values);
    await fetchProperties();
    showToast("Property added successfully");
    return res.data;
  }

  async function handleUpdate(values: PropertyFormValues) {
    if (!editingProperty) throw new Error("No property selected for editing");
    const res = await updateProperty(editingProperty.id, values);
    await fetchProperties();
    showToast("Property updated successfully");
    return res.data;
  }

  async function handleEditClick(row: PropertyListing) {
    setError(null);
    try {
      const res = await getProperty(row.id);
      setEditingProperty(res.data);
    } catch {
      showToast("Failed to load property details. Please try again.", "error");
    }
  }

  const exportParams = {
    search: search || undefined,
    status: status === "All Statuses" ? undefined : (status as PropertyListing["status"]),
    type: type === "All Types" ? undefined : (type as PropertyListing["type"]),
  };

  const columns: Column<PropertyListing>[] = [
    { header: "Title", render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
    { header: "Location", render: (r) => r.location },
    { header: "Price", align: "right", render: (r) => currency(r.price) },
    { header: "Type", render: (r) => <StatusBadge status={capitalize(r.type)} tone={r.type === "sale" ? "blue" : "slate"} /> },
    { header: "Status", render: (r) => <StatusBadge status={capitalize(r.status)} tone={statusTone[r.status]} /> },
    ...((canEdit
      ? [
          {
            header: "Actions",
            align: "right" as const,
            render: (r: PropertyListing) => (
              <button className="text-slate-400 hover:text-navy-700" aria-label="Edit property" onClick={() => handleEditClick(r)}>
                <Pencil size={15} />
              </button>
            ),
          },
        ]
      : []) satisfies Column<PropertyListing>[]),
  ];

  return (
    <div>
      <PageHeader
        title="Property Inventory"
        subtitle="Manage the municipal property register"
        action={canEdit ? <Button icon={<Plus size={16} />} onClick={() => setIsCreating(true)}>Add Property</Button> : undefined}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Properties" value={String(counts.total)} icon={Building2} />
        <StatCard label="Available" value={String(counts.available)} icon={Tag} />
        <StatCard label="Rented" value={String(counts.rented)} icon={Key} />
      </div>

      <Card className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search by title or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <FilterSelect className="capitalize" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value)} />
          <FilterSelect className="capitalize" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
          <a href={getCsvExportUrl(exportParams)}>
            <Button variant="secondary" icon={<Download size={15} />}>
              Export CSV
            </Button>
          </a>
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

        {isLoading ? (
          <TableSkeleton rows={6} columns={canEdit ? 6 : 5} />
        ) : properties.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">No properties match your search or filters.</p>
        ) : (
          <DataTable columns={columns} rows={properties} rowKey={(r) => String(r.id)} />
        )}

        <div className="mt-4">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </Card>

      {isCreating && <PropertyFormModal onSubmit={handleCreate} onClose={() => setIsCreating(false)} />}
      {editingProperty && (
        <PropertyFormModal property={editingProperty} onSubmit={handleUpdate} onClose={() => setEditingProperty(null)} />
      )}
    </div>
  );
}
