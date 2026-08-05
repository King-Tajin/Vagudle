import { useEffect, useRef } from "react";
import type { CharStatus } from "../lib/statuses";
import { getIdTokenForCurrentUser } from "../lib/cloudSync";
import { saveServerDailyProgress } from "../lib/daily";

type Params = {
  isWebDailyMode: boolean;
  guesses: string[];
  cellColors: { [key: string]: CharStatus };
};

export const useDailyProgressSync = ({
  isWebDailyMode,
  guesses,
  cellColors,
}: Params): void => {
  const sentCountRef = useRef(0);

  useEffect(() => {
    if (!isWebDailyMode) {
      sentCountRef.current = guesses.length;
      return;
    }
    if (guesses.length <= sentCountRef.current) return;
    sentCountRef.current = guesses.length;

    void (async () => {
      const idToken = await getIdTokenForCurrentUser();
      if (!idToken) return;
      await saveServerDailyProgress(idToken, guesses, cellColors);
    })();
  }, [guesses, cellColors, isWebDailyMode]);
};
