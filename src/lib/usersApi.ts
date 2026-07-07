import { apiFetch } from "./api";
import type { AuthUser } from "../types/auth";
import type { CreateUserValues, ManagedUser, UserListMeta, UserListParams } from "../types/user";

interface ListResponse {
  data: ManagedUser[];
  meta: UserListMeta;
}

interface ItemResponse {
  data: ManagedUser;
}

function buildQueryString(params: UserListParams) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listUsers(params: UserListParams) {
  return apiFetch<ListResponse>(`/users${buildQueryString(params)}`);
}

export function createUser(payload: CreateUserValues) {
  return apiFetch<{ user: AuthUser }>("/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUserStatus(id: number, isActive: boolean) {
  return apiFetch<ItemResponse>(`/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function updateUserRole(id: number, role: "agent" | "viewer") {
  return apiFetch<ItemResponse>(`/users/${id}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
