import { useState, useRef } from "react";
import {
  Achievement,
  AchievementContext,
  AchievementProgress,
  ACHIEVEMENTS,
  loadAchievementProgress,
  saveAchievementProgress,
} from "../lib/achievements";

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

  const resetWinRecord = () => {
    hasRecordedWinRef.current = false;
  };

  const recordWin = (event: WinEvent): Achievement[] => {
    if (hasRecordedWinRef.current) return [];
    hasRecordedWinRef.current = true;

    const next: AchievementProgress = { ...progress };
    next.totalWins += 1;
    if (event.hardMode && event.wordLength >= 5) next.wonInHardMode5Plus = true;
    if (event.guessCount <= 5) next.wonIn5GuessesEver = true;
    if (event.wordLength === 7) next.wonWith7LettersEver = true;

    const ctx: AchievementContext = {
      totalWins: next.totalWins,
      wonInHardMode5Plus: next.wonInHardMode5Plus,
      wonIn5GuessesEver: next.wonIn5GuessesEver,
      wonWith7LettersEver: next.wonWith7LettersEver,
    };

    const newlyUnlocked = ACHIEVEMENTS.filter(
      (a) => !progress.unlockedIds.includes(a.id) && a.check(ctx)
    );

    next.unlockedIds = [
      ...progress.unlockedIds,
      ...newlyUnlocked.map((a) => a.id),
    ];

    setProgress(next);
    saveAchievementProgress(next);
    return newlyUnlocked;
  };

  return {
    unlockedIds: progress.unlockedIds,
    recordWin,
    resetWinRecord,
  };
};
