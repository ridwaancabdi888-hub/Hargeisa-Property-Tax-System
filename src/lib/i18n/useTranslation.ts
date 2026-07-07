import { useSettings } from "../../context/SettingsContext";
import { translations, type Language } from "./translations";

function isSupportedLanguage(code: string | undefined): code is Language {
  return code === "en" || code === "so";
}

export function useTranslation() {
  const { settings } = useSettings();
  const language: Language = isSupportedLanguage(settings?.language) ? settings.language : "en";
  return { t: translations[language], language };
}
