import { apiFetch, apiUpload } from "./api";
import type { AuthUser } from "../types/auth";

interface UserResponse {
  data: AuthUser;
}

export function updateProfile(payload: { fullName: string; email: string }) {
  return apiFetch<UserResponse>("/profile", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function changePassword(payload: { currentPassword: string; newPassword: string }) {
  return apiFetch("/profile/password", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);
  return apiUpload<UserResponse>("/profile/avatar", formData);
}

export function deleteAvatar() {
  return apiFetch<UserResponse>("/profile/avatar", { method: "DELETE" });
}
