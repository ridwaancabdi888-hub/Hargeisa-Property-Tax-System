export type Theme = "light" | "dark";
export type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

export interface UserSettings {
  theme: Theme;
  language: string;
  timezone: string;
  dateFormat: DateFormat;
  notifyPropertyCreated: boolean;
  notifyPropertySold: boolean;
  notifyPropertyDeleted: boolean;
  updatedAt: string;
}

export interface UpdateSettingsPayload {
  theme?: Theme;
  language?: string;
  timezone?: string;
  dateFormat?: DateFormat;
  notifyPropertyCreated?: boolean;
  notifyPropertySold?: boolean;
  notifyPropertyDeleted?: boolean;
}

export const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "so", label: "Soomaali" },
  { code: "ar", label: "العربية" },
];

export const DATE_FORMATS: DateFormat[] = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];
