export type Language = "en" | "sv";

export type LanguageOption = {
  code: Language;
  label: string;
};

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English" },
  { code: "sv", label: "Svenska" },
];

export const DEFAULT_LANGUAGE: Language = "en";

const LANGUAGE_CODES = LANGUAGES.map((lang) => lang.code);

export const isSupportedLanguage = (value: string): value is Language =>
  (LANGUAGE_CODES as string[]).includes(value);

export const detectBrowserLanguage = (): Language => {
  if (typeof navigator === "undefined") return DEFAULT_LANGUAGE;

  const candidates = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const primary = candidate.split("-")[0].toLowerCase();
    if (isSupportedLanguage(primary)) return primary;
  }

  return DEFAULT_LANGUAGE;
};
