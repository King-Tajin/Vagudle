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

    const controller = new AbortController();

    const submit = async () => {
      setSaveStatus("saving");

      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          if (controller.signal.aborted) return;
        }

        const ok = await submitActivityDailyResult(
          activityAccessToken,
          guesses,
          controller.signal
        );
        const aborted = controller.signal.aborted;
        if (aborted) return;

        if (ok) {
          setSaveStatus("saved");
          return;
        }
      }

      setSaveStatus("failed");
    };

    void submit();

    return () => controller.abort();
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
