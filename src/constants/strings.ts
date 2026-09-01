import { settingsKey } from "../lib/localStorage";
import {
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  isSupportedLanguage,
  type Language,
} from "./languages";
import * as en from "./strings.en";
import * as sv from "./strings.sv";

type Widen<T> = T extends string ? string : T;
type StringsModule = { [K in keyof typeof en]: Widen<(typeof en)[K]> };

const modules: Record<Language, StringsModule> = {
  en,
  sv,
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

const active: StringsModule = modules[resolveActiveLanguage()] ?? en;

export default active;
