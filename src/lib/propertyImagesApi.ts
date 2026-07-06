import { apiFetch, apiUpload } from "./api";
import type { PropertyImage } from "../types/property";

interface UploadResponse {
  data: PropertyImage[];
}

export function uploadPropertyImages(propertyId: number, files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append("images", file));
  return apiUpload<UploadResponse>(`/property-listings/${propertyId}/images`, formData);
}

export function deletePropertyImage(propertyId: number, imageId: number) {
  return apiFetch(`/property-listings/${propertyId}/images/${imageId}`, { method: "DELETE" });
}
