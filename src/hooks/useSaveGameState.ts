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
  dailyStreakRemindersEnabled: boolean;
  streakResetWarningHours: number;
  customReminderTimeEnabled: boolean;
  customReminderHour: number;
  customReminderMinute: number;
  customReminderPeriod: "AM" | "PM";
  inactivityReminderEnabled: boolean;
  inactivityReminderDays: number;
  hapticsEnabled: boolean;
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
  hardMode,
  wordLength,
  showGrayCount,
  autoGray,
  autoGreen,
  extraEffects,
  dailyStreakRemindersEnabled,
  streakResetWarningHours,
  customReminderTimeEnabled,
  customReminderHour,
  customReminderMinute,
  customReminderPeriod,
  inactivityReminderEnabled,
  inactivityReminderDays,
  hapticsEnabled,
  isDuelMode,
  duelConfig,
  isChallengeMode,
  challengeConfig,
  isDailyMode,
  dailyConfig,
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
      dailyStreakRemindersEnabled,
      streakResetWarningHours,
      customReminderTimeEnabled,
      customReminderHour,
      customReminderMinute,
      customReminderPeriod,
      inactivityReminderEnabled,
      inactivityReminderDays,
      hapticsEnabled,
    });
  }, [
    isLoading,
    wordLength,
    showGrayCount,
    hardMode,
    autoGray,
    autoGreen,
    extraEffects,
    dailyStreakRemindersEnabled,
    streakResetWarningHours,
    customReminderTimeEnabled,
    customReminderHour,
    customReminderMinute,
    customReminderPeriod,
    inactivityReminderEnabled,
    inactivityReminderDays,
    hapticsEnabled,
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
    } else if (isDailyMode && dailyConfig) {
      saveDailyProgress(dailyConfig.date, { guesses, cellColors });
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
    isDailyMode,
    dailyConfig,
    solution,
    hardMode,
  ]);
};
