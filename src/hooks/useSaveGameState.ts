import { useEffect } from "react";
import type { CharStatus } from "../lib/statuses";
import type { ChallengeConfig } from "../lib/challenge";
import type { DuelConfig } from "../lib/duel";
import {
  saveGameStateToLocalStorage,
  saveSettingsToLocalStorage,
} from "../lib/localStorage";
import { saveChallengeState } from "../lib/challenge";
import { saveDuelState } from "../lib/duel";

type Params = {
  isLoading: boolean;
  solution: string;
  guesses: string[];
  cellColors: { [key: string]: CharStatus };
  autoGrayLetters: Set<string>;
  hardMode: boolean;
  wordLength: number;
  showGrayCount: boolean;
  autoGray: boolean;
  autoGreen: boolean;
  extraEffects: boolean;
  isDuelMode: boolean;
  duelConfig: DuelConfig | null;
  isChallengeMode: boolean;
  challengeConfig: ChallengeConfig | null;
};

export const useSaveGameState = ({
  isLoading,
  solution,
  guesses,
  cellColors,
  autoGrayLetters,
  hardMode,
  wordLength,
  showGrayCount,
  autoGray,
  autoGreen,
  extraEffects,
  isDuelMode,
  duelConfig,
  isChallengeMode,
  challengeConfig,
}: Params) => {
  useEffect(() => {
    if (isLoading) return;
    saveSettingsToLocalStorage({
      wordLength,
      showGrayCount,
      hardMode,
      autoGray,
      autoGreen,
      extraEffects,
    });
  }, [
    isLoading,
    wordLength,
    showGrayCount,
    hardMode,
    autoGray,
    autoGreen,
    extraEffects,
  ]);

  useEffect(() => {
    if (isLoading) return;
    if (!solution) return;
    if (isDuelMode && duelConfig) {
      saveDuelState(duelConfig.id, duelConfig.discord_id, {
        guesses,
        cellColors,
        autoGrayLetters: Array.from(autoGrayLetters),
      });
    } else if (isChallengeMode && challengeConfig) {
      saveChallengeState(challengeConfig.id, {
        guesses,
        cellColors,
        autoGrayLetters: Array.from(autoGrayLetters),
      });
    } else {
      saveGameStateToLocalStorage({
        guesses,
        solution,
        cellColors,
        autoGrayLetters: Array.from(autoGrayLetters),
        hardMode,
      });
    }
  }, [
    isLoading,
    guesses,
    cellColors,
    autoGrayLetters,
    isDuelMode,
    duelConfig,
    isChallengeMode,
    challengeConfig,
    solution,
    hardMode,
  ]);
};
