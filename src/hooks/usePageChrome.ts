import { useEffect } from "react";
import type { Language } from "../constants/languages";
import strings from "../constants/strings";

type Params = {
  isDuelMode: boolean;
  isChallengeMode: boolean;
  isDailyMode: boolean;
  language: Language;
};

export const usePageChrome = ({
  isDuelMode,
  isChallengeMode,
  isDailyMode,
  language,
}: Params) => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    document.title = isDuelMode
      ? strings.PAGE_TITLE_DUEL
      : isChallengeMode
        ? strings.PAGE_TITLE_CHALLENGE
        : isDailyMode
          ? strings.PAGE_TITLE_DAILY
          : "Vagudle";
    return () => {
      document.title = "Vagudle";
    };
  }, [isChallengeMode, isDuelMode, isDailyMode]);
};
