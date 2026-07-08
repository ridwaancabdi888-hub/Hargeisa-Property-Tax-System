import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import SearchInput from "../components/ui/SearchInput";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import { TableSkeleton } from "../components/ui/Skeleton";
import ClientFormModal from "../components/clients/ClientFormModal";
import { createClient, deleteClient, listClients, updateClient } from "../lib/clientsApi";
import { useTranslation } from "../lib/i18n/useTranslation";
import type { Client, ClientFormValues, ClientListMeta } from "../types/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";

export default function Clients() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const canEdit = user?.role === "admin" || user?.role === "agent";
  const canDelete = user?.role === "admin";

  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<ClientListMeta>({ total: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [isCreating, setIsCreating] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listClients({ page, limit: 10, search: search || undefined });
      setClients(res.data);
      setMeta(res.meta);
    } catch {
      setError("Failed to load clients. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeout = setTimeout(fetchClients, 300);
    return () => clearTimeout(timeout);
  }, [fetchClients]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  async function handleCreate(values: ClientFormValues) {
    const res = await createClient(values);
    await fetchClients();
    showToast("Client added successfully");
    return res.data;
  }

  async function handleUpdate(values: ClientFormValues) {
    if (!editingClient) throw new Error("No client selected for editing");
    const res = await updateClient(editingClient.id, values);
    await fetchClients();
    showToast("Client updated successfully");
    return res.data;
  }

  async function handleConfirmDelete() {
    if (!deletingClient) return;
    setIsSubmitting(true);
    try {
      await deleteClient(deletingClient.id);
      setDeletingClient(null);
      await fetchClients();
      showToast(`"${deletingClient.fullName}" deleted`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to delete client.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const columns: Column<Client>[] = [
    { header: t.pages.clients.fullName, render: (r) => <span className="font-medium text-slate-900">{r.fullName}</span> },
    { header: t.pages.clients.phone, render: (r) => r.phone || "—" },
    { header: t.pages.clients.email, render: (r) => r.email || "—" },
    { header: t.pages.clients.address, render: (r) => r.address || "—" },
    ...((canEdit || canDelete
      ? [
          {
            header: t.common.actions,
            align: "right" as const,
            render: (r: Client) => (
              <div className="flex items-center justify-end gap-3">
                {canEdit && (
                  <button className="text-slate-400 hover:text-navy-700" aria-label="Edit client" onClick={() => setEditingClient(r)}>
                    <Pencil size={15} />
                  </button>
                )}
                {canDelete && (
                  <button className="text-slate-400 hover:text-red-600" aria-label="Delete client" onClick={() => setDeletingClient(r)}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ),
          },
        ]
      : []) satisfies Column<Client>[]),
  ];

  return (
    <div>
      <PageHeader
        title={t.pages.clients.title}
        subtitle={t.pages.clients.subtitle}
        action={canEdit ? <Button icon={<Plus size={16} />} onClick={() => setIsCreating(true)}>{t.pages.clients.addClient}</Button> : undefined}
      />

      <Card className="mt-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder={t.pages.clients.searchPlaceholder} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

        {isLoading ? (
          <TableSkeleton rows={6} columns={5} />
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">{t.common.noResults}</p>
        ) : (
          <DataTable columns={columns} rows={clients} rowKey={(r) => String(r.id)} />
        )}

        <div className="mt-4">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </Card>

      {isCreating && <ClientFormModal onSubmit={handleCreate} onClose={() => setIsCreating(false)} />}
      {editingClient && (
        <ClientFormModal client={editingClient} onSubmit={handleUpdate} onClose={() => setEditingClient(null)} />
      )}

      {deletingClient && (
        <ConfirmModal
          title={t.pages.clients.deleteTitle}
          message={`"${deletingClient.fullName}" ${t.pages.clients.deleteMessage}`}
          confirmLabel={t.common.delete}
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeletingClient(null)}
        />
      )}
    </div>
  );
}
