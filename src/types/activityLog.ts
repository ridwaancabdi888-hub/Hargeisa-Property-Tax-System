export interface ActivityLogEntry {
  id: number;
  userId: number | null;
  userFullName: string | null;
  userUsername: string | null;
  action: string;
  entityType: string | null;
  entityId: number | null;
  description: string;
  oldValues: Record<string, unknown> | null;
  newValues: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface ActivityLogListMeta {
  total: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}

export interface ActivityLogListParams {
  page?: number;
  limit?: number;
  search?: string;
  action?: string;
  userId?: number;
  date_from?: string;
  date_to?: string;
}

export const ACTIVITY_ACTIONS = [
  "login",
  "logout",
  "property_created",
  "property_updated",
  "property_deleted",
  "profile_updated",
  "password_changed",
];
