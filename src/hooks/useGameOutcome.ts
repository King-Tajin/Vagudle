import React, { useEffect } from "react";
import { REVEAL_TIME_MS } from "../constants/settings";
import { WIN_MESSAGES, CHALLENGE_WIN_MESSAGES } from "../constants/strings";

type Params = {
  isGameWon: boolean;
  isGameLost: boolean;
  solution: string;
  isDuelMode: boolean;
  isChallengeMode: boolean;
  restoredRef: React.RefObject<boolean>;
  extraEffectsRef: React.RefObject<boolean>;
  achievementRevealPendingRef: React.RefObject<boolean>;
  showSuccessAlert: (
    message: string,
    options?: { delayMs?: number; onClose?: () => void }
  ) => void;
  setIsCelebrating: (value: boolean) => void;
  setIsRevealingAchievement: (value: boolean) => void;
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
  achievementRevealPendingRef,
  showSuccessAlert,
  setIsCelebrating,
  setIsRevealingAchievement,
  setIsDuelModalOpen,
  setIsStatsModalOpen,
}: Params) => {
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (isGameWon) {
      if (restoredRef.current) {
        restoredRef.current = false;
        return;
      }
      const delayMs = REVEAL_TIME_MS * solution.length;
      if (extraEffectsRef.current) {
        timeoutId = setTimeout(() => setIsCelebrating(true), delayMs + 250);
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
      if (extraEffectsRef.current && achievementRevealPendingRef.current) {
        achievementRevealPendingRef.current = false;
        timeoutId = setTimeout(() => setIsRevealingAchievement(true), delay);
      } else if (isDuelMode) {
        timeoutId = setTimeout(() => setIsDuelModalOpen(true), delay);
      } else {
        timeoutId = setTimeout(() => setIsStatsModalOpen(true), delay);
      }
    }

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isGameWon,
    isGameLost,
    showSuccessAlert,
    solution,
    isChallengeMode,
    isDuelMode,
  ]);
};
