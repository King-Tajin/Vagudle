import type React from "react";
import { useState, useEffect } from "react";
import { submitActivityDailyResult } from "../lib/daily";

export type DailyActivitySaveStatus = "idle" | "saving" | "saved" | "failed";

type Params = {
  isDailyActivityMode: boolean;
  activityAccessToken: string | null;
  isGameWon: boolean;
  isGameLost: boolean;
  guesses: string[];
  submittedRef: React.RefObject<boolean>;
};

export const useDailyActivityResult = ({
  isDailyActivityMode,
  activityAccessToken,
  isGameWon,
  isGameLost,
  guesses,
  submittedRef,
}: Params): DailyActivitySaveStatus => {
  const [saveStatus, setSaveStatus] = useState<DailyActivitySaveStatus>("idle");

  useEffect(() => {
    if (!isDailyActivityMode || !activityAccessToken) return;
    if (!isGameWon && !isGameLost) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    let cancelled = false;

    const submit = async () => {
      if (cancelled) return;
      setSaveStatus("saving");
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
        if (cancelled) return;
        const ok = await submitActivityDailyResult(
          activityAccessToken,
          guesses
        );
        if (cancelled) return;
        if (ok) {
          setSaveStatus("saved");
          return;
        }
      }
      if (cancelled) return;
      setSaveStatus("failed");
    };

    void submit();

    return () => {
      cancelled = true;
    };
  }, [
    isGameWon,
    isGameLost,
    isDailyActivityMode,
    activityAccessToken,
    guesses,
    submittedRef,
  ]);

  return saveStatus;
};
