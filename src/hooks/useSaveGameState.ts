import { useEffect } from "react";
import type { CharStatus } from "../lib/statuses";
import type { ChallengeConfig } from "../lib/challenge";
import type { DuelConfig } from "../lib/duel";
import type { DailyConfig } from "../lib/daily";
import {
  saveGameStateToLocalStorage,
  saveSettingsToLocalStorage,
} from "../lib/localStorage";
import { saveChallengeState } from "../lib/challenge";
import { saveDuelState } from "../lib/duel";
import { saveDailyProgress } from "../lib/daily";
import type { GameSettingsValues } from "./useGameSettings";

type Params = {
  isLoading: boolean;
  solution: string;
  guesses: string[];
  cellColors: { [key: string]: CharStatus };
  autoGrayLetters: Set<string>;
  wordLength: number;
  settings: GameSettingsValues;
  isDuelMode: boolean;
  duelConfig: DuelConfig | null;
  isChallengeMode: boolean;
  challengeConfig: ChallengeConfig | null;
  isDailyMode: boolean;
  dailyConfig: DailyConfig | null;
};

export const useSaveGameState = ({
  isLoading,
  solution,
  guesses,
  cellColors,
  autoGrayLetters,
  wordLength,
  settings,
  isDuelMode,
  duelConfig,
  isChallengeMode,
  challengeConfig,
  isDailyMode,
  dailyConfig,
}: Params) => {
  useEffect(() => {
    if (isLoading) return;
    saveSettingsToLocalStorage({ wordLength, ...settings });
  }, [isLoading, wordLength, settings]);

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
    } else if (isDailyMode && dailyConfig) {
      saveDailyProgress(dailyConfig.date, { guesses, cellColors });
    } else {
      saveGameStateToLocalStorage({
        guesses,
        solution,
        cellColors,
        autoGrayLetters: Array.from(autoGrayLetters),
        hardMode: settings.hardMode,
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
    isDailyMode,
    dailyConfig,
    solution,
    settings.hardMode,
  ]);
};
