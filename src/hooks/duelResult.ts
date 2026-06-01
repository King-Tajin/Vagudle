import React, { useState, useEffect } from "react";
import type { DuelSaveStatus } from "../lib/duel";
import { submitDuelResult, submitActivityDuelResult } from "../lib/duel";

type Params = {
  isDuelMode: boolean;
  duelToken: string | null;
  activityInstanceId: string | null;
  activityAccessToken: string | null;
  isGameWon: boolean;
  isGameLost: boolean;
  guessCount: number;
  submittedRef: React.MutableRefObject<boolean>;
};

export const duelResult = ({
  isDuelMode,
  duelToken,
  activityInstanceId,
  activityAccessToken,
  isGameWon,
  isGameLost,
  guessCount,
  submittedRef,
}: Params): DuelSaveStatus => {
  const [saveStatus, setSaveStatus] = useState<DuelSaveStatus>("idle");

  useEffect(() => {
    if (!isDuelMode) return;
    const hasTokenPath = !!duelToken;
    const hasActivityPath = !!(activityInstanceId && activityAccessToken);
    if (!hasTokenPath && !hasActivityPath) return;
    if (!isGameWon && !isGameLost) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    const submit = async () => {
      setSaveStatus("saving");
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 15000));
        const ok = hasTokenPath
          ? await submitDuelResult(duelToken!, isGameWon, guessCount)
          : await submitActivityDuelResult(
              activityInstanceId!,
              activityAccessToken!,
              isGameWon,
              guessCount
            );
        if (ok) {
          setSaveStatus("saved");
          return;
        }
      }
      setSaveStatus("failed");
    };

    void submit();
  }, [
    isGameWon,
    isGameLost,
    isDuelMode,
    duelToken,
    activityInstanceId,
    activityAccessToken,
    guessCount,
    submittedRef,
  ]);

  return saveStatus;
};
