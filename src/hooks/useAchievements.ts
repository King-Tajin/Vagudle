import { useState, useRef } from "react";
import {
  Achievement,
  AchievementContext,
  AchievementProgress,
  ACHIEVEMENTS,
  ACHIEVEMENTS_KEY,
  loadAchievementProgress,
  saveAchievementProgress,
  loadWordConnoisseurList,
  saveWordConnoisseurList,
  deleteWordConnoisseurList,
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
  const [uniqueWordCount, setUniqueWordCount] = useState<number>(() => {
    const p = loadAchievementProgress();
    if (p.unlockedIds.includes("word_connoisseur")) return 200;
    return loadWordConnoisseurList().length;
  });
  const hasRecordedWinRef = useRef(false);

  useStorageSync(ACHIEVEMENTS_KEY, () => {
    setProgress(loadAchievementProgress());
  });

  const resetWinRecord = () => {
    hasRecordedWinRef.current = false;
  };

  const commitProgress = (
    base: AchievementProgress,
    next: AchievementProgress,
    ctx: AchievementContext
  ): Achievement[] => {
    const newlyUnlocked = ACHIEVEMENTS.filter(
      (a) => !base.unlockedIds.includes(a.id) && a.check(ctx)
    );

    next.unlockedIds = [...base.unlockedIds, ...newlyUnlocked.map((a) => a.id)];

    if (newlyUnlocked.some((a) => a.id === "word_connoisseur")) {
      deleteWordConnoisseurList();
      setUniqueWordCount(200);
    }

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

    const ctx: AchievementContext = {
      totalWins: next.totalWins,
      wonInHardMode5Plus: next.wonInHardMode5Plus,
      wonIn5GuessesEver: next.wonIn5GuessesEver,
      wonWith7LettersEver: next.wonWith7LettersEver,
      lastGuess: "",
      uniqueWordCount,
    };

    return commitProgress(base, next, ctx);
  };

  const recordGuess = (word: string): Achievement[] => {
    const base = loadAchievementProgress();
    const normalized = word.toLowerCase();

    let currentUniqueCount = uniqueWordCount;

    if (!base.unlockedIds.includes("word_connoisseur")) {
      const list = loadWordConnoisseurList();
      if (!list.includes(normalized)) {
        const updated = [...list, normalized];
        saveWordConnoisseurList(updated);
        currentUniqueCount = updated.length;
        setUniqueWordCount(updated.length);
      }
    }

    const ctx: AchievementContext = {
      totalWins: base.totalWins,
      wonInHardMode5Plus: base.wonInHardMode5Plus,
      wonIn5GuessesEver: base.wonIn5GuessesEver,
      wonWith7LettersEver: base.wonWith7LettersEver,
      lastGuess: normalized,
      uniqueWordCount: currentUniqueCount,
    };

    const next: AchievementProgress = { ...base };
    return commitProgress(base, next, ctx);
  };

  return {
    unlockedIds: progress.unlockedIds,
    uniqueWordCount,
    recordWin,
    recordGuess,
    resetWinRecord,
  };
};
