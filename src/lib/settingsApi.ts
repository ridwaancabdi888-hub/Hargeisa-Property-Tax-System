import { apiFetch } from "./api";
import type { UpdateSettingsPayload, UserSettings } from "../types/settings";

interface SettingsResponse {
  data: UserSettings;
}

export function getSettings() {
  return apiFetch<SettingsResponse>("/settings");
}

export function updateSettings(payload: UpdateSettingsPayload) {
  return apiFetch<SettingsResponse>("/settings", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}
