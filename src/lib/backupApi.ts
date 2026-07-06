import { apiFetch, apiUpload } from "./api";
import type { BackupEntry } from "../types/backup";

interface ListResponse {
  data: BackupEntry[];
}

interface CreateResponse {
  data: { filename: string };
}

export function listBackups() {
  return apiFetch<ListResponse>("/backups");
}

export function createBackup() {
  return apiFetch<CreateResponse>("/backups", { method: "POST" });
}

export function getBackupDownloadUrl(filename: string) {
  return `/api/backups/${encodeURIComponent(filename)}/download`;
}

export function restoreBackup(file: File) {
  const formData = new FormData();
  formData.append("backup", file);
  return apiUpload<{ data: { safetyBackup: string } }>("/backups/restore", formData);
}
