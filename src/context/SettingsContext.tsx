import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { getSettings, updateSettings as updateSettingsApi } from "../lib/settingsApi";
import { useAuth } from "./AuthContext";
import type { UpdateSettingsPayload, UserSettings } from "../types/settings";

interface SettingsContextValue {
  settings: UserSettings | null;
  isLoading: boolean;
  updateSettings: (payload: UpdateSettingsPayload) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSettings(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getSettings()
      .then((res) => setSettings(res.data))
      .catch(() => setSettings(null))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", settings?.theme === "dark");
  }, [settings?.theme]);

  const updateSettings = useCallback(async (payload: UpdateSettingsPayload) => {
    const res = await updateSettingsApi(payload);
    setSettings(res.data);
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, updateSettings }}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
