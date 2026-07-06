import { apiFetch } from "./api";
import type { ActivityLogEntry, ActivityLogListMeta, ActivityLogListParams } from "../types/activityLog";

interface ListResponse {
  data: ActivityLogEntry[];
  meta: ActivityLogListMeta;
}

function buildQueryString(params: ActivityLogListParams) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listActivityLogs(params: ActivityLogListParams) {
  return apiFetch<ListResponse>(`/activity-logs${buildQueryString(params)}`);
}
