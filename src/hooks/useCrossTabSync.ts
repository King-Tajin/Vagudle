import React from "react";
import type { CharStatus } from "../lib/statuses";
import type { ChallengeConfig } from "../lib/challenge";
import { challengeStateKey, loadChallengeState } from "../lib/challenge";
import type { DuelConfig } from "../lib/duel";
import { duelStateKey, loadDuelState } from "../lib/duel";
import {
  gameStateKey,
  settingsKey,
  normalStatKey,
  hardStatKey,
  loadGameStateFromLocalStorage,
  loadSettingsFromLocalStorage,
  type GameStats,
} from "../lib/localStorage";
import { loadStats } from "../lib/stats";
import {
  dailyStatsKey,
  loadDailyStats,
  type DailyStats,
  type DailyConfig,
  dailyProgressKey,
  loadDailyProgress,
} from "../lib/daily";
import {
  BG_KEY,
  ATTRIBUTION_HIDDEN_KEY,
  loadBackgroundId,
  loadHiddenAttributionIds,
  type BackgroundId,
} from "../lib/backgrounds";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../constants/settings";
import { useStorageSync } from "./useStorageSync";
import type { Language } from "../constants/languages";

type Params = {
  isLoading: boolean;
  isMobile: boolean;
  isDuelMode: boolean;
  isChallengeMode: boolean;
  isDailyMode: boolean;
  duelConfig: DuelConfig | null;
  challengeConfig: ChallengeConfig | null;
  dailyConfig: DailyConfig | null;
  solution: string;
  hardMode: boolean;
  restoredGameRef: React.RefObject<boolean>;
  achievementCheckedRef: React.RefObject<boolean>;
  duelSubmittedRef: React.RefObject<boolean>;
  onNewGameSynced: (solution: string) => void;
  setSolution: (v: string) => void;
  setGuesses: (v: string[]) => void;
  setCellColors: React.Dispatch<
    React.SetStateAction<{ [key: string]: CharStatus }>
  >;
  setIsGameWon: (v: boolean) => void;
  setIsGameLost: (v: boolean) => void;
  setCurrentGuess: (v: string) => void;
  setCurrentRowClass: (v: string) => void;
  setIsRevealing: (v: boolean) => void;
  language: Language;
  setWordLength: (v: number) => void;
  setHardMode: (v: boolean) => void;
  setShowGrayCount: (v: boolean) => void;
  setAutoGray: (v: boolean) => void;
  setAutoGreen: (v: boolean) => void;
  setExtraEffects: (v: boolean) => void;
  setStats: (v: GameStats) => void;
  setHardStats: (v: GameStats) => void;
  setDailyStats: (v: DailyStats) => void;
  setBackgroundId: (v: BackgroundId) => void;
  setHiddenAttributionIds: (v: BackgroundId[]) => void;
};

const markRestoredOutcome = (
  won: boolean,
  lost: boolean,
  restoredGameRef: React.RefObject<boolean>,
  achievementCheckedRef: React.RefObject<boolean> | null,
  duelSubmittedRef: React.RefObject<boolean> | null
) => {
  if (!won && !lost) return;
  restoredGameRef.current = true;
  if (achievementCheckedRef) achievementCheckedRef.current = true;
  if (duelSubmittedRef) duelSubmittedRef.current = true;
};

export const useCrossTabSync = ({
  isLoading,
  isMobile,
  isDuelMode,
  isChallengeMode,
  isDailyMode,
  duelConfig,
  challengeConfig,
  dailyConfig,
  solution,
  hardMode,
  language,
  restoredGameRef,
  achievementCheckedRef,
  duelSubmittedRef,
  onNewGameSynced,
  setSolution,
  setGuesses,
  setCellColors,
  setIsGameWon,
  setIsGameLost,
  setCurrentGuess,
  setCurrentRowClass,
  setIsRevealing,
  setWordLength,
  setHardMode,
  setShowGrayCount,
  setAutoGray,
  setAutoGreen,
  setExtraEffects,
  setStats,
  setHardStats,
  setDailyStats,
  setBackgroundId,
  setHiddenAttributionIds,
}: Params) => {
  React.useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === null && e.storageArea === localStorage) {
        window.location.reload();
      }
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  useStorageSync(settingsKey, () => {
    const s = loadSettingsFromLocalStorage();
    if (s.language !== language) {
      window.location.reload();
      return;
    }
    setWordLength(s.wordLength);
    setHardMode(s.hardMode);
    setShowGrayCount(s.showGrayCount);
    setAutoGray(s.autoGray);
    setAutoGreen(s.autoGreen);
    setExtraEffects(s.extraEffects);
  });

  useStorageSync(normalStatKey, () => setStats(loadStats(false)));
  useStorageSync(hardStatKey, () => setHardStats(loadStats(true)));
  useStorageSync(dailyStatsKey, () => setDailyStats(loadDailyStats()));

  useStorageSync(BG_KEY, () => setBackgroundId(loadBackgroundId(isMobile)));
  useStorageSync(ATTRIBUTION_HIDDEN_KEY, () =>
    setHiddenAttributionIds(loadHiddenAttributionIds())
  );

  useStorageSync(gameStateKey, () => {
    if (isLoading || isDuelMode || isChallengeMode || isDailyMode) return;
    const saved = loadGameStateFromLocalStorage();
    if (!saved) return;

    const isNewPuzzle = saved.solution !== solution;
    const wordUpper = saved.solution.toUpperCase();
    const won = saved.guesses.some((g) => g.toUpperCase() === wordUpper);
    const savedHardMode = saved.hardMode ?? hardMode;
    const maxChallenges = savedHardMode
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
    const lost = !won && saved.guesses.length >= maxChallenges;
    const alreadyDecided = won || lost;

    if (alreadyDecided) {
      markRestoredOutcome(
        won,
        lost,
        restoredGameRef,
        achievementCheckedRef,
        null
      );
    }
    if (isNewPuzzle) {
      setCurrentGuess("");
      setCurrentRowClass("");
      setIsRevealing(false);
    }

    if (isNewPuzzle && !alreadyDecided) {
      onNewGameSynced(saved.solution);
    } else {
      setSolution(saved.solution);
    }
    setGuesses(saved.guesses);
    setCellColors((saved.cellColors as { [key: string]: CharStatus }) ?? {});
    setIsGameWon(won);
    setIsGameLost(lost);
  });

  useStorageSync(
    dailyConfig ? dailyProgressKey(dailyConfig.date) : "__no_active_daily__",
    () => {
      if (isLoading || !isDailyMode || !dailyConfig) return;
      const saved = loadDailyProgress(dailyConfig.date);
      if (!saved) return;
      const wordUpper = dailyConfig.word.toUpperCase();
      const won = saved.guesses.some((g) => g.toUpperCase() === wordUpper);
      const maxChallenges = dailyConfig.hardMode
        ? HARD_MODE_MAX_CHALLENGES
        : NORMAL_MODE_MAX_CHALLENGES;
      const lost = !won && saved.guesses.length >= maxChallenges;

      markRestoredOutcome(won, lost, restoredGameRef, null, null);

      setGuesses(saved.guesses);
      setCellColors((saved.cellColors as { [key: string]: CharStatus }) ?? {});
      setIsGameWon(won);
      setIsGameLost(lost);
    }
  );

  useStorageSync(
    duelConfig
      ? duelStateKey(duelConfig.id, duelConfig.discord_id)
      : "__no_active_duel__",
    () => {
      if (isLoading || !isDuelMode || !duelConfig) return;
      const saved = loadDuelState(duelConfig.id, duelConfig.discord_id);
      if (!saved) return;
      const wordUpper = duelConfig.word.toUpperCase();
      const won = saved.guesses.some((g) => g.toUpperCase() === wordUpper);
      const lost = !won && saved.guesses.length >= duelConfig.guesses;

      markRestoredOutcome(won, lost, restoredGameRef, null, duelSubmittedRef);

      setGuesses(saved.guesses);
      setCellColors(saved.cellColors as { [key: string]: CharStatus });
      setIsGameWon(won);
      setIsGameLost(lost);
    }
  );

  useStorageSync(
    challengeConfig
      ? challengeStateKey(challengeConfig.id)
      : "__no_active_challenge__",
    () => {
      if (isLoading || !isChallengeMode || !challengeConfig) return;
      const saved = loadChallengeState(challengeConfig.id);
      if (!saved) return;
      const wordUpper = challengeConfig.word.toUpperCase();
      const won = saved.guesses.some((g) => g.toUpperCase() === wordUpper);
      const lost = !won && saved.guesses.length >= challengeConfig.guesses;

      markRestoredOutcome(won, lost, restoredGameRef, null, null);

      setGuesses(saved.guesses);
      setCellColors(saved.cellColors as { [key: string]: CharStatus });
      setIsGameWon(won);
      setIsGameLost(lost);
    }
  );
};
