import { apiFetch } from "./api";
import type {
  PropertyDetail,
  PropertyFormValues,
  PropertyListMeta,
  PropertyListing,
  PropertyListParams,
} from "../types/property";

interface ListResponse {
  data: PropertyListing[];
  meta: PropertyListMeta;
}

interface ItemResponse {
  data: PropertyListing;
}

interface DetailResponse {
  data: PropertyDetail;
}

function buildQueryString(params: PropertyListParams) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

export function listProperties(params: PropertyListParams) {
  return apiFetch<ListResponse>(`/property-listings${buildQueryString(params)}`);
}

export function getProperty(id: number) {
  return apiFetch<DetailResponse>(`/property-listings/${id}`);
}

export function createProperty(payload: PropertyFormValues) {
  return apiFetch<ItemResponse>("/property-listings", {
    method: "POST",
    body: JSON.stringify({ ...payload, price: Number(payload.price) }),
  });
}

export function updateProperty(id: number, payload: PropertyFormValues) {
  return apiFetch<ItemResponse>(`/property-listings/${id}`, {
    method: "PUT",
    body: JSON.stringify({ ...payload, price: Number(payload.price) }),
  });
}

export function deleteProperty(id: number) {
  return apiFetch(`/property-listings/${id}`, { method: "DELETE" });
}

export function getCsvExportUrl(params: PropertyListParams) {
  return `/api/property-listings/export/csv${buildQueryString(params)}`;
}

export function getExcelExportUrl(params: PropertyListParams) {
  return `/api/property-listings/export/excel${buildQueryString(params)}`;
}
