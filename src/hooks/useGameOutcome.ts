import React, { useEffect } from "react";
import { REVEAL_TIME_MS } from "../constants/settings";
import { WIN_MESSAGES, CHALLENGE_WIN_MESSAGES } from "../constants/strings";

type Params = {
  isGameWon: boolean;
  isGameLost: boolean;
  solution: string;
  isDuelMode: boolean;
  isChallengeMode: boolean;
  restoredRef: React.MutableRefObject<boolean>;
  extraEffectsRef: React.MutableRefObject<boolean>;
  showSuccessAlert: (
    message: string,
    options?: { delayMs?: number; onClose?: () => void }
  ) => void;
  setIsCelebrating: (value: boolean) => void;
  setIsDuelModalOpen: (value: boolean) => void;
  setIsStatsModalOpen: (value: boolean) => void;
};

export const useGameOutcome = ({
  isGameWon,
  isGameLost,
  solution,
  isDuelMode,
  isChallengeMode,
  restoredRef,
  extraEffectsRef,
  showSuccessAlert,
  setIsCelebrating,
  setIsDuelModalOpen,
  setIsStatsModalOpen,
}: Params) => {
  useEffect(() => {
    if (isGameWon) {
      if (restoredRef.current) {
        restoredRef.current = false;
        return;
      }
      const delayMs = REVEAL_TIME_MS * solution.length;
      if (extraEffectsRef.current) {
        setTimeout(() => setIsCelebrating(true), delayMs + 250);
      } else {
        const pool =
          isDuelMode || isChallengeMode ? CHALLENGE_WIN_MESSAGES : WIN_MESSAGES;
        const winMessage = pool[Math.floor(Math.random() * pool.length)];
        showSuccessAlert(winMessage, {
          delayMs,
          onClose: () => {
            if (isDuelMode) setIsDuelModalOpen(true);
            else setIsStatsModalOpen(true);
          },
        });
      }
    }

    if (isGameLost) {
      if (restoredRef.current) {
        restoredRef.current = false;
        return;
      }
      const delay = (solution.length + 1) * REVEAL_TIME_MS;
      if (isDuelMode) setTimeout(() => setIsDuelModalOpen(true), delay);
      else setTimeout(() => setIsStatsModalOpen(true), delay);
    }
  }, [
    isGameWon,
    isGameLost,
    showSuccessAlert,
    solution,
    isChallengeMode,
    isDuelMode,
  ]);
};
