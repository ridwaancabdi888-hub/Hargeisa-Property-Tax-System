import { apiFetch } from "./api";
import type { Client, ClientDetail, ClientFormValues, ClientListMeta, ClientListParams } from "../types/client";

interface ListResponse {
  data: Client[];
  meta: ClientListMeta;
}

interface ItemResponse {
  data: Client;
}

interface DetailResponse {
  data: ClientDetail;
}

function buildQueryString(params: ClientListParams) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

function toPayload(payload: ClientFormValues) {
  return {
    fullName: payload.fullName,
    phone: payload.phone.trim() === "" ? null : payload.phone,
    email: payload.email.trim() === "" ? null : payload.email,
    address: payload.address.trim() === "" ? null : payload.address,
    notes: payload.notes.trim() === "" ? null : payload.notes,
  };
}

export function listClients(params: ClientListParams) {
  return apiFetch<ListResponse>(`/clients${buildQueryString(params)}`);
}

export function getClient(id: number) {
  return apiFetch<DetailResponse>(`/clients/${id}`);
}

export function createClient(payload: ClientFormValues) {
  return apiFetch<ItemResponse>("/clients", {
    method: "POST",
    body: JSON.stringify(toPayload(payload)),
  });
}

export function updateClient(id: number, payload: ClientFormValues) {
  return apiFetch<ItemResponse>(`/clients/${id}`, {
    method: "PUT",
    body: JSON.stringify(toPayload(payload)),
  });
}

export function deleteClient(id: number) {
  return apiFetch(`/clients/${id}`, { method: "DELETE" });
}
