import { useCallback, useEffect, useState } from "react";
import { KeyRound, Plus, UserCheck, UserX } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import SearchInput from "../components/ui/SearchInput";
import FilterSelect from "../components/ui/FilterSelect";
import Button from "../components/ui/Button";
import DataTable, { type Column } from "../components/ui/DataTable";
import StatusBadge from "../components/ui/StatusBadge";
import Pagination from "../components/ui/Pagination";
import ConfirmModal from "../components/ui/ConfirmModal";
import { TableSkeleton } from "../components/ui/Skeleton";
import CreateUserModal from "../components/users/CreateUserModal";
import ResetPasswordModal from "../components/users/ResetPasswordModal";
import { createUser, listUsers, resetUserPassword, updateUserRole, updateUserStatus } from "../lib/usersApi";
import { useTranslation } from "../lib/i18n/useTranslation";
import type { CreateUserValues, ManagedUser, UserListMeta } from "../types/user";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";

const roleOptions = ["All Roles", "admin", "agent", "viewer"];
const roleTone = { admin: "blue", agent: "slate", viewer: "amber" } as const;

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [meta, setMeta] = useState<UserListMeta>({ total: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All Roles");
  const [page, setPage] = useState(1);

  const [isCreating, setIsCreating] = useState(false);
  const [deactivating, setDeactivating] = useState<ManagedUser | null>(null);
  const [resettingPasswordFor, setResettingPasswordFor] = useState<ManagedUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await listUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: role === "All Roles" ? undefined : (role as ManagedUser["role"]),
      });
      setUsers(res.data);
      setMeta(res.meta);
    } catch {
      setError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [page, search, role]);

  useEffect(() => {
    const timeout = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timeout);
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, role]);

  async function handleCreate(values: CreateUserValues) {
    await createUser(values);
    await fetchUsers();
    showToast("User created successfully");
  }

  async function handleActivate(target: ManagedUser) {
    try {
      await updateUserStatus(target.id, true);
      await fetchUsers();
      showToast(`${target.username} reactivated`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to activate user.", "error");
    }
  }

  async function handleConfirmDeactivate() {
    if (!deactivating) return;
    setIsSubmitting(true);
    try {
      await updateUserStatus(deactivating.id, false);
      setDeactivating(null);
      await fetchUsers();
      showToast(`${deactivating.username} deactivated`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to deactivate user.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRoleChange(target: ManagedUser, newRole: string) {
    if (newRole === target.role) return;
    try {
      await updateUserRole(target.id, newRole as "agent" | "viewer");
      await fetchUsers();
      showToast(`${target.username}'s role changed to ${newRole}`);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to change role.", "error");
    }
  }

  async function handleResetPassword(newPassword: string) {
    if (!resettingPasswordFor) return;
    await resetUserPassword(resettingPasswordFor.id, newPassword);
    showToast(`Password reset for ${resettingPasswordFor.username}`);
  }

  const columns: Column<ManagedUser>[] = [
    { header: t.pages.userManagement.fullName, render: (r) => <span className="font-medium text-slate-900">{r.fullName}</span> },
    { header: t.pages.userManagement.username, render: (r) => r.username },
    { header: t.pages.userManagement.email, render: (r) => r.email },
    {
      header: t.pages.userManagement.role,
      render: (r) =>
        r.role === "admin" || r.id === currentUser?.id ? (
          <StatusBadge status={t.roleLabel[r.role]} tone={roleTone[r.role]} />
        ) : (
          <FilterSelect
            className="w-28 capitalize"
            options={["agent", "viewer"]}
            value={r.role}
            onChange={(e) => handleRoleChange(r, e.target.value)}
          />
        ),
    },
    {
      header: t.common.status,
      render: (r) => <StatusBadge status={r.isActive ? t.common.active : t.common.inactive} tone={r.isActive ? "green" : "red"} />,
    },
    { header: t.pages.userManagement.joined, render: (r) => new Date(r.createdAt).toLocaleDateString() },
    {
      header: t.common.actions,
      align: "right",
      render: (r) => {
        if (r.role === "admin" || r.id === currentUser?.id) {
          return <span className="text-xs text-slate-400">—</span>;
        }
        return (
          <div className="flex items-center justify-end gap-3">
            <button
              className="inline-flex items-center gap-1.5 text-xs font-medium text-navy-700 hover:underline"
              onClick={() => setResettingPasswordFor(r)}
            >
              <KeyRound size={13} /> Reset Password
            </button>
            {r.isActive ? (
              <button
                className="inline-flex items-center gap-1.5 text-xs font-medium text-red-600 hover:underline"
                onClick={() => setDeactivating(r)}
              >
                <UserX size={13} /> {t.pages.userManagement.deactivate}
              </button>
            ) : (
              <button
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:underline"
                onClick={() => handleActivate(r)}
              >
                <UserCheck size={13} /> {t.pages.userManagement.activate}
              </button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.pages.userManagement.title}
        subtitle={t.pages.userManagement.subtitle}
        action={
          <Button icon={<Plus size={16} />} onClick={() => setIsCreating(true)}>
            {t.pages.userManagement.addUser}
          </Button>
        }
      />

      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput placeholder="Search by name, username, or email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <FilterSelect className="capitalize" options={roleOptions} value={role} onChange={(e) => setRole(e.target.value)} />
        </div>

        {error && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{error}</div>}

        {isLoading ? (
          <TableSkeleton rows={6} columns={7} />
        ) : users.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">{t.common.noResults}</p>
        ) : (
          <DataTable columns={columns} rows={users} rowKey={(r) => String(r.id)} />
        )}

        <div className="mt-4">
          <Pagination meta={meta} onPageChange={setPage} />
        </div>
      </Card>

      {isCreating && <CreateUserModal onSubmit={handleCreate} onClose={() => setIsCreating(false)} />}

      {deactivating && (
        <ConfirmModal
          title="Deactivate this user?"
          message={`"${deactivating.username}" will no longer be able to sign in until reactivated.`}
          confirmLabel="Deactivate"
          isSubmitting={isSubmitting}
          onConfirm={handleConfirmDeactivate}
          onCancel={() => setDeactivating(null)}
        />
      )}

      {resettingPasswordFor && (
        <ResetPasswordModal
          username={resettingPasswordFor.username}
          onSubmit={handleResetPassword}
          onClose={() => setResettingPasswordFor(null)}
        />
      )}
    </div>
  );
}
