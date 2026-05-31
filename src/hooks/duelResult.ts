import React, { useState, useEffect } from "react";
import type { DuelSaveStatus } from "../lib/duel";
import { submitDuelResult } from "../lib/duel";

type Params = {
  isDuelMode: boolean;
  duelToken: string | null;
  isGameWon: boolean;
  isGameLost: boolean;
  guessCount: number;
  submittedRef: React.MutableRefObject<boolean>;
};

export const duelResult = ({
  isDuelMode,
  duelToken,
  isGameWon,
  isGameLost,
  guessCount,
  submittedRef,
}: Params): DuelSaveStatus => {
  const [saveStatus, setSaveStatus] = useState<DuelSaveStatus>("idle");

  useEffect(() => {
    if (!isDuelMode || !duelToken) return;
    if (!isGameWon && !isGameLost) return;
    if (submittedRef.current) return;
    submittedRef.current = true;

    const submit = async () => {
      setSaveStatus("saving");
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await new Promise((r) => setTimeout(r, 15000));
        const ok = await submitDuelResult(duelToken, isGameWon, guessCount);
        if (ok) {
          setSaveStatus("saved");
          return;
        }
      }
      setSaveStatus("failed");
    };

    void submit();
  }, [isGameWon, isGameLost, isDuelMode, duelToken, guessCount, submittedRef]);

  return saveStatus;
};
