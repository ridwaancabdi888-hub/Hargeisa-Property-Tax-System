import { apiFetch } from "./api";
import type {
  PropertyCounts,
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

interface CountsResponse {
  data: PropertyCounts;
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

export function getPropertyCounts() {
  return apiFetch<CountsResponse>("/property-listings/counts");
}

function toPayload(payload: PropertyFormValues) {
  return {
    ...payload,
    price: Number(payload.price),
    latitude: payload.latitude.trim() === "" ? null : Number(payload.latitude),
    longitude: payload.longitude.trim() === "" ? null : Number(payload.longitude),
    clientId: payload.clientId.trim() === "" ? null : Number(payload.clientId),
  };
}

export function createProperty(payload: PropertyFormValues) {
  return apiFetch<ItemResponse>("/property-listings", {
    method: "POST",
    body: JSON.stringify(toPayload(payload)),
  });
}

export function updateProperty(id: number, payload: PropertyFormValues) {
  return apiFetch<ItemResponse>(`/property-listings/${id}`, {
    method: "PUT",
    body: JSON.stringify(toPayload(payload)),
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

export function getTaxBillUrl(id: number) {
  return `/api/property-listings/${id}/tax-bill`;
}
