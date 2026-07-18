import type React from "react";
import { useState, useEffect } from "react";
import type { DuelSaveStatus } from "../lib/duel";
import { submitDuelResult, submitActivityDuelResult } from "../lib/duel";

type Params = {
  isDuelMode: boolean;
  duelToken: string | null;
  activityAccessToken: string | null;
  activityDuelId: string | null;
  isGameWon: boolean;
  isGameLost: boolean;
  guessCount: number;
  submittedRef: React.RefObject<boolean>;
};

export const useDuelResult = ({
  isDuelMode,
  duelToken,
  activityAccessToken,
  activityDuelId,
  isGameWon,
  isGameLost,
  guessCount,
  submittedRef,
}: Params): DuelSaveStatus => {
  const [saveStatus, setSaveStatus] = useState<DuelSaveStatus>("idle");

  useEffect(() => {
    if (!isDuelMode) return;
    const hasTokenPath = !!duelToken;
    const hasActivityPath = !!activityAccessToken && !!activityDuelId;
    if (!hasTokenPath && !hasActivityPath) return;
    if (!isGameWon && !isGameLost) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    const submit = async () => {
      setSaveStatus("saving");
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 2000));
        let ok: boolean;
        if (duelToken) {
          ok = await submitDuelResult(duelToken, isGameWon, guessCount);
        } else if (activityAccessToken && activityDuelId) {
          ok = await submitActivityDuelResult(
            activityAccessToken,
            activityDuelId,
            isGameWon,
            guessCount
          );
        } else {
          break;
        }
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
    activityAccessToken,
    activityDuelId,
    guessCount,
    submittedRef,
  ]);

  return saveStatus;
};
