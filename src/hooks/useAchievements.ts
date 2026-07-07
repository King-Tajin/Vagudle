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
import { loadStats } from "../lib/stats";
import { getGuessStatuses } from "../lib/statuses";
import { useStorageSync } from "./useStorageSync";

type WinEvent = {
  wordLength: number;
  guessCount: number;
  hardMode: boolean;
};

const getRealTotalWins = (): number => {
  const normal = loadStats(false);
  const hard = loadStats(true);
  return (
    normal.totalGames -
    normal.gamesFailed +
    (hard.totalGames - hard.gamesFailed)
  );
};

const isCloseCallGuess = (solution: string, guess: string): boolean => {
  const statuses = getGuessStatuses(solution, guess);
  const grayCount = statuses.filter((s) => s === "absent").length;
  const greenCount = statuses.filter((s) => s === "correct").length;
  return grayCount === 1 && greenCount === statuses.length - 1;
};

export const computeCloseCallStreak = (
  guessHistory: string[],
  solution: string
): boolean => {
  let streak: string[] = [];

  for (const guess of guessHistory) {
    const normalized = guess.toLowerCase();

    if (isCloseCallGuess(solution, normalized)) {
      if (streak.includes(normalized)) {
        streak = [normalized];
      } else {
        streak.push(normalized);
      }
      if (streak.length >= 3) return true;
    } else {
      streak = [];
    }
  }

  return false;
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
    if (event.hardMode && event.wordLength >= 5) next.wonInHardMode5Plus = true;
    if (event.guessCount <= 5) next.wonIn5GuessesEver = true;
    if (event.wordLength === 7) next.wonWith7LettersEver = true;

    const ctx: AchievementContext = {
      totalWins: getRealTotalWins(),
      wonInHardMode5Plus: next.wonInHardMode5Plus,
      wonIn5GuessesEver: next.wonIn5GuessesEver,
      wonWith7LettersEver: next.wonWith7LettersEver,
      lastGuess: "",
      uniqueWordCount,
      gotCloseCallStreak: false,
    };

    return commitProgress(base, next, ctx);
  };

  const recordGuess = (
    word: string,
    solution: string,
    previousGuesses: string[]
  ): Achievement[] => {
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

    const gotCloseCallStreak = computeCloseCallStreak(
      [...previousGuesses, normalized],
      solution
    );

    const ctx: AchievementContext = {
      totalWins: getRealTotalWins(),
      wonInHardMode5Plus: base.wonInHardMode5Plus,
      wonIn5GuessesEver: base.wonIn5GuessesEver,
      wonWith7LettersEver: base.wonWith7LettersEver,
      lastGuess: normalized,
      uniqueWordCount: currentUniqueCount,
      gotCloseCallStreak,
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
