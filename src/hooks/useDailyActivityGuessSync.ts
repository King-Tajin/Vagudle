import { useEffect, useRef } from "react";
import { submitActivityDailyGuess } from "../lib/daily";

type Params = {
  isDailyActivityMode: boolean;
  activityAccessToken: string | null;
  guesses: string[];
};

export const useDailyActivityGuessSync = ({
  isDailyActivityMode,
  activityAccessToken,
  guesses,
}: Params): void => {
  const sentCountRef = useRef(0);

  useEffect(() => {
    if (!isDailyActivityMode || !activityAccessToken) return;
    if (guesses.length <= sentCountRef.current) return;

    const startIndex = sentCountRef.current;
    const pending = guesses.slice(startIndex);
    sentCountRef.current = guesses.length;

    pending.forEach((guess, i) => {
      void submitActivityDailyGuess(
        activityAccessToken,
        guess,
        startIndex + i + 1
      );
    });
  }, [guesses, isDailyActivityMode, activityAccessToken]);
};
