import { settingsKey } from "../lib/localStorage";
import {
  DEFAULT_LANGUAGE,
  detectBrowserLanguage,
  isSupportedLanguage,
  type Language,
} from "./languages";
import type * as en from "./strings.en";

type Widen<T> = T extends string ? string : T;
type StringsModule = { [K in keyof typeof en]: Widen<(typeof en)[K]> };

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

const loadStringsModule = (language: Language) => {
  switch (language) {
    case "sv":
      return import("./strings.sv");
    case "en":
    default:
      return import("./strings.en");
  }
};

const active: StringsModule = await loadStringsModule(resolveActiveLanguage());

export default active;
