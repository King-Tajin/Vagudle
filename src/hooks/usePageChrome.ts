import { useEffect } from "react";

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
      ? "Vagudle - Duel"
      : isChallengeMode
        ? "Vagudle - Challenge"
        : isDailyMode
          ? "Vagudle - Daily"
          : "Vagudle";
    return () => {
      document.title = "Vagudle";
    };
  }, [isChallengeMode, isDuelMode, isDailyMode]);
};
