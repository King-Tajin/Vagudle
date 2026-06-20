import { useState, useRef } from "react";
import {
  Achievement,
  AchievementContext,
  AchievementProgress,
  ACHIEVEMENTS,
  ACHIEVEMENTS_KEY,
  loadAchievementProgress,
  saveAchievementProgress,
} from "../lib/achievements";
import { useStorageSync } from "./useStorageSync";

type WinEvent = {
  wordLength: number;
  guessCount: number;
  hardMode: boolean;
};

export const useAchievements = () => {
  const [progress, setProgress] = useState<AchievementProgress>(() =>
    loadAchievementProgress()
  );
  const hasRecordedWinRef = useRef(false);

  useStorageSync(ACHIEVEMENTS_KEY, () => {
    setProgress(loadAchievementProgress());
  });

  const resetWinRecord = () => {
    hasRecordedWinRef.current = false;
  };

  const commitProgress = (
    base: AchievementProgress,
    next: AchievementProgress
  ): Achievement[] => {
    const ctx: AchievementContext = {
      totalWins: next.totalWins,
      wonInHardMode5Plus: next.wonInHardMode5Plus,
      wonIn5GuessesEver: next.wonIn5GuessesEver,
      wonWith7LettersEver: next.wonWith7LettersEver,
      guessedWords: next.guessedWords,
    };

    const newlyUnlocked = ACHIEVEMENTS.filter(
      (a) => !base.unlockedIds.includes(a.id) && a.check(ctx)
    );

    next.unlockedIds = [...base.unlockedIds, ...newlyUnlocked.map((a) => a.id)];

    setProgress(next);
    saveAchievementProgress(next);
    return newlyUnlocked;
  };

  const recordWin = (event: WinEvent): Achievement[] => {
    if (hasRecordedWinRef.current) return [];
    hasRecordedWinRef.current = true;

    const base = loadAchievementProgress();
    const next: AchievementProgress = { ...base };
    next.totalWins += 1;
    if (event.hardMode && event.wordLength >= 5) next.wonInHardMode5Plus = true;
    if (event.guessCount <= 5) next.wonIn5GuessesEver = true;
    if (event.wordLength === 7) next.wonWith7LettersEver = true;

    return commitProgress(base, next);
  };

  const recordGuess = (word: string): Achievement[] => {
    const normalized = word.toLowerCase();
    const base = loadAchievementProgress();
    if (base.guessedWords.includes(normalized)) return [];

    const next: AchievementProgress = {
      ...base,
      guessedWords: [...base.guessedWords, normalized],
    };

    return commitProgress(base, next);
  };

  return {
    unlockedIds: progress.unlockedIds,
    recordWin,
    recordGuess,
    resetWinRecord,
  };
};
