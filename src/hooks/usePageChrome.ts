import { useEffect } from "react";
import {
  PAGE_TITLE_DUEL,
  PAGE_TITLE_CHALLENGE,
  PAGE_TITLE_DAILY,
} from "../constants/strings";

type Params = {
  isDuelMode: boolean;
  isChallengeMode: boolean;
  isDailyMode: boolean;
};

export const usePageChrome = ({
  isDuelMode,
  isChallengeMode,
  isDailyMode,
}: Params) => {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    document.title = isDuelMode
      ? PAGE_TITLE_DUEL
      : isChallengeMode
        ? PAGE_TITLE_CHALLENGE
        : isDailyMode
          ? PAGE_TITLE_DAILY
          : "Vagudle";
    return () => {
      document.title = "Vagudle";
    };
  }, [isChallengeMode, isDuelMode, isDailyMode]);
};
