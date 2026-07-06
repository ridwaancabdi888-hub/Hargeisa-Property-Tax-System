import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, FileDown, FileSpreadsheet } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import PropertyFormModal from "../components/properties/PropertyFormModal";
import { TableSkeleton } from "../components/ui/Skeleton";
import {
  createProperty,
  deleteProperty,
  getCsvExportUrl,
  getExcelExportUrl,
  getProperty,
  listProperties,
  updateProperty,
} from "../lib/propertiesApi";
import type { PropertyDetail, PropertyFormValues, PropertyListMeta, PropertyListing } from "../types/property";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";

const currency = (n: number) => `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const typeOptions = ["All Types", "rent", "sale"];
const statusOptions = ["All Statuses", "available", "sold", "rented"];

const statusTone = {
  available: "green",
  rented: "amber",
  sold: "slate",
} as const;

export default function PropertyListings() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const canEdit = user?.role === "admin" || user?.role === "agent";
  const canDelete = user?.role === "admin";

  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [meta, setMeta] = useState<PropertyListMeta>({ total: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("All Types");
  const [status, setStatus] = useState("All Statuses");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);

  const [editingProperty, setEditingProperty] = useState<PropertyDetail | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState<PropertyListing | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProperties = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listProperties({
        page,
        limit: 10,
        search: search || undefined,
        type: type === "All Types" ? undefined : (type as PropertyListing["type"]),
        status: status === "All Statuses" ? undefined : (status as PropertyListing["status"]),
        min_price: minPrice ? Number(minPrice) : undefined,
        max_price: maxPrice ? Number(maxPrice) : undefined,
      });
      setProperties(res.data);
      setMeta(res.meta);
    } catch {
      setError("Failed to load properties. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, type, status, minPrice, maxPrice]);

  useEffect(() => {
    const timeout = setTimeout(fetchProperties, 300);
    return () => clearTimeout(timeout);
  }, [fetchProperties]);

  useEffect(() => {
    setPage(1);
  }, [search, type, status, minPrice, maxPrice]);

  async function handleCreate(values: PropertyFormValues) {
    const res = await createProperty(values);
    await fetchProperties();
    showToast("Property created successfully");
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

  async function handleDelete() {
    if (!deletingProperty) return;
    setIsDeleting(true);
    try {
      await deleteProperty(deletingProperty.id);
      setDeletingProperty(null);
      await fetchProperties();
      showToast("Property deleted successfully");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to delete property.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const exportParams = {
    search: search || undefined,
    type: type === "All Types" ? undefined : (type as PropertyListing["type"]),
    status: status === "All Statuses" ? undefined : (status as PropertyListing["status"]),
    min_price: minPrice ? Number(minPrice) : undefined,
    max_price: maxPrice ? Number(maxPrice) : undefined,
  };

  const columns: Column<PropertyListing>[] = [
    { header: "Title", render: (r) => <span className="font-medium text-slate-900">{r.title}</span> },
    { header: "Location", render: (r) => r.location },
    { header: "Price", align: "right", render: (r) => currency(r.price) },
    {
      header: "Type",
      render: (r) => <StatusBadge status={capitalize(r.type)} tone={r.type === "sale" ? "blue" : "slate"} />,
    },
    {
      header: "Status",
      render: (r) => <StatusBadge status={capitalize(r.status)} tone={statusTone[r.status]} />,
    },
    { header: "Created", render: (r) => new Date(r.createdAt).toLocaleDateString() },
    ...((canEdit || canDelete
      ? [
          {
            header: "Actions",
            align: "right" as const,
            render: (r: PropertyListing) => (
              <div className="flex justify-end gap-3">
                {canEdit && (
                  <button
                    className="text-slate-400 hover:text-navy-700"
                    aria-label="Edit property"
                    onClick={() => handleEditClick(r)}
                  >
                    <Pencil size={15} />
                  </button>
                )}
                {canDelete && (
                  <button
                    className="text-slate-400 hover:text-red-600"
                    aria-label="Delete property"
                    onClick={() => setDeletingProperty(r)}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []) satisfies Column<PropertyListing>[]),
  ];

  return (
    <div>
      <PageHeader
        title="Properties"
        subtitle="Manage rental and sale property listings"
        action={
          <div className="flex items-center gap-2">
            <a href={getCsvExportUrl(exportParams)}>
              <Button variant="secondary" icon={<FileDown size={15} />}>
                CSV
              </Button>
            </a>
            <a href={getExcelExportUrl(exportParams)}>
              <Button variant="secondary" icon={<FileSpreadsheet size={15} />}>
                Excel
              </Button>
            </a>
            {canEdit && (
              <Button icon={<Plus size={16} />} onClick={() => setIsCreating(true)}>
                Add Property
              </Button>
            )}
          </div>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center">
          <SearchInput
            placeholder="Search by title or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <FilterSelect className="capitalize" options={typeOptions} value={type} onChange={(e) => setType(e.target.value)} />
          <FilterSelect
            className="capitalize"
            options={statusOptions}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          />
          <input
            type="number"
            placeholder="Min price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 lg:w-28"
          />
          <input
            type="number"
            placeholder="Max price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 lg:w-28"
          />
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

        {isLoading ? (
          <TableSkeleton rows={6} columns={canEdit || canDelete ? 7 : 6} />
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
        <PropertyFormModal
          property={editingProperty}
          onSubmit={handleUpdate}
          onClose={() => setEditingProperty(null)}
        />
      )}

      {deletingProperty && (
        <ConfirmModal
          title="Delete this property?"
          message={`"${deletingProperty.title}" will be permanently removed. This cannot be undone.`}
          isSubmitting={isDeleting}
          onConfirm={handleDelete}
          onCancel={() => setDeletingProperty(null)}
        />
      )}
    </div>
  );
}
