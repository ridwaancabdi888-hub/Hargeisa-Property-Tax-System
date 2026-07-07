import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FilterSelect from "../components/ui/FilterSelect";
import { useSettings } from "../context/SettingsContext";
import { useToast } from "../context/ToastContext";
import { ApiError } from "../lib/api";
import { DATE_FORMATS, LANGUAGES, type DateFormat, type Theme } from "../types/settings";
import { useTranslation } from "../lib/i18n/useTranslation";

export default function Settings() {
  const { settings, isLoading, updateSettings } = useSettings();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const [theme, setTheme] = useState<Theme>("light");
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("");
  const [dateFormat, setDateFormat] = useState<DateFormat>("MM/DD/YYYY");
  const [notifyPropertyCreated, setNotifyPropertyCreated] = useState(true);
  const [notifyPropertySold, setNotifyPropertySold] = useState(true);
  const [notifyPropertyDeleted, setNotifyPropertyDeleted] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setTheme(settings.theme);
    setLanguage(settings.language);
    setTimezone(settings.timezone);
    setDateFormat(settings.dateFormat);
    setNotifyPropertyCreated(settings.notifyPropertyCreated);
    setNotifyPropertySold(settings.notifyPropertySold);
    setNotifyPropertyDeleted(settings.notifyPropertyDeleted);
  }, [settings]);

  async function handleSave() {
    setIsSaving(true);
    try {
      await updateSettings({
        theme,
        language,
        timezone,
        dateFormat,
        notifyPropertyCreated,
        notifyPropertySold,
        notifyPropertyDeleted,
      });
      showToast("Settings saved successfully");
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : "Failed to save settings.", "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">Loading settings...</p>;
  }

  return (
    <div>
      <PageHeader title={t.pages.settings.title} subtitle={t.pages.settings.subtitle} />

      <div className="max-w-2xl space-y-4">
        <Card title={t.pages.settings.appearance} subtitle={t.pages.settings.appearanceSubtitle}>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                theme === "light"
                  ? "border-navy-700 bg-navy-50 text-navy-900"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <Sun size={16} /> {t.pages.settings.light}
            </button>
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                theme === "dark"
                  ? "border-navy-700 bg-navy-50 text-navy-900 dark:bg-slate-700 dark:text-slate-100"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
              }`}
            >
              <Moon size={16} /> {t.pages.settings.dark}
            </button>
          </div>
        </Card>

        <Card title={t.pages.settings.locale} subtitle={t.pages.settings.localeSubtitle}>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">{t.pages.settings.language}</label>
              <FilterSelect
                className="w-full"
                options={LANGUAGES.map((l) => l.code)}
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">{t.pages.settings.timezone}</label>
              <input
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                placeholder="e.g. Africa/Mogadishu"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-navy-700 focus:outline-none focus:ring-1 focus:ring-navy-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-slate-400">{t.pages.settings.dateFormat}</label>
              <FilterSelect
                className="w-full"
                options={DATE_FORMATS}
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value as DateFormat)}
              />
            </div>
          </div>
        </Card>

        <Card title={t.pages.settings.notifications} subtitle={t.pages.settings.notificationsSubtitle}>
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
              {t.pages.settings.notifyCreated}
              <input
                type="checkbox"
                checked={notifyPropertyCreated}
                onChange={(e) => setNotifyPropertyCreated(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
              {t.pages.settings.notifySold}
              <input
                type="checkbox"
                checked={notifyPropertySold}
                onChange={(e) => setNotifyPropertySold(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
            </label>
            <label className="flex items-center justify-between text-sm text-slate-700 dark:text-slate-300">
              {t.pages.settings.notifyDeleted}
              <input
                type="checkbox"
                checked={notifyPropertyDeleted}
                onChange={(e) => setNotifyPropertyDeleted(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-navy-800 focus:ring-navy-700"
              />
            </label>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? t.pages.settings.saving : t.pages.settings.saveSettings}
          </Button>
        </div>
      </div>
    </div>
  );
}
