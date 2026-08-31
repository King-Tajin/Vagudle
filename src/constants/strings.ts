import { settingsKey } from "../lib/localStorage";
import {
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  isSupportedLanguage,
  type Language,
} from "./languages";
import * as en from "./strings.en";

const modules: Record<Language, typeof en> = {
  en,
};

const readStoredLanguage = (): Language | null => {
  try {
    const stored = localStorage.getItem(settingsKey);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as { language?: unknown };
    if (
      typeof parsed.language === "string" &&
      isSupportedLanguage(parsed.language)
    ) {
      return parsed.language;
    }
    return null;
  } catch {
    return null;
  }
};

const resolveActiveLanguage = (): Language =>
  readStoredLanguage() ?? detectBrowserLanguage() ?? DEFAULT_LANGUAGE;

const active: typeof en = modules[resolveActiveLanguage()] ?? en;

export default active;
