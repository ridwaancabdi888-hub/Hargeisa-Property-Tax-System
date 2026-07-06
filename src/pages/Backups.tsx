import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Database, Download, Upload } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { TableSkeleton } from "../components/ui/Skeleton";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";
import { createBackup, getBackupDownloadUrl, listBackups, restoreBackup } from "../lib/backupApi";
import type { BackupEntry } from "../types/backup";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Backups() {
  const { showToast } = useToast();
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);

  async function refresh() {
    setIsLoading(true);
    try {
      const res = await listBackups();
      setBackups(res.data);
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to load backups.", "error");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreateBackup() {
    setIsCreating(true);
    try {
      await createBackup();
      showToast("Backup created successfully");
      await refresh();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to create backup.", "error");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleConfirmRestore() {
    if (!pendingFile) return;
    setIsRestoring(true);
    try {
      await restoreBackup(pendingFile);
      showToast("Database restored successfully");
      setPendingFile(null);
      setConfirmText("");
      await refresh();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to restore backup.", "error");
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <div>
      <PageHeader title="Backups" subtitle="Create, download, and restore database backups" />

      <div className="max-w-3xl space-y-4">
        <Card title="Create Backup" subtitle="Take a snapshot of the current database">
          <Button icon={<Database size={15} />} onClick={handleCreateBackup} disabled={isCreating}>
            {isCreating ? "Creating..." : "Create Backup Now"}
          </Button>
        </Card>

        <Card title="Existing Backups" subtitle="Stored on the server, most recent first">
          {isLoading ? (
            <TableSkeleton rows={3} columns={3} />
          ) : backups.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-500 dark:text-slate-400">No backups yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-700">
              {backups.map((b) => (
                <li key={b.filename} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{b.filename}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatSize(b.sizeBytes)} &middot; {new Date(b.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <a href={getBackupDownloadUrl(b.filename)}>
                    <Button variant="secondary" icon={<Download size={14} />}>
                      Download
                    </Button>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Restore from Backup" subtitle="Upload a .sql file to restore the database">
          <div className="flex items-center gap-3">
            <input ref={fileInputRef} type="file" accept=".sql" className="hidden" onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)} />
            <Button variant="secondary" icon={<Upload size={15} />} onClick={() => fileInputRef.current?.click()}>
              Choose .sql File
            </Button>
            {pendingFile && <span className="text-sm text-slate-600 dark:text-slate-300">{pendingFile.name}</span>}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            A safety backup of the current database is always taken automatically before restoring.
          </p>
        </Card>
      </div>

      {pendingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-card dark:bg-slate-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertTriangle size={18} />
            </span>
            <h2 className="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">Restore database?</h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              This replaces all current data with the contents of <strong>{pendingFile.name}</strong>. Type{" "}
              <strong>RESTORE</strong> to confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type RESTORE"
              className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
            />
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setPendingFile(null);
                  setConfirmText("");
                }}
                disabled={isRestoring}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={handleConfirmRestore} disabled={confirmText !== "RESTORE" || isRestoring}>
                {isRestoring ? "Restoring..." : "Restore Database"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
