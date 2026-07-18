import { useState, useRef } from "react";
import {
  type Achievement,
  type AchievementContext,
  type AchievementProgress,
  ACHIEVEMENTS,
  ACHIEVEMENTS_KEY,
  WORD_CONNOISSEUR_KEY,
  COMPLETIONIST_ID,
  isCompletionistUnlocked,
  getEffectiveUnlockedIds,
  loadAchievementProgress,
  saveAchievementProgress,
  loadWordConnoisseurList,
  saveWordConnoisseurList,
  deleteWordConnoisseurList,
} from "../lib/achievements";
import { loadStats } from "../lib/stats";
import { getGuessStatuses } from "../lib/statuses";
import { useStorageSync } from "./useStorageSync";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../constants/settings";

type WinEvent = {
  wordLength: number;
  guessCount: number;
  hardMode: boolean;
  guesses: string[];
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

const getBestCurrentStreak = (): number => {
  const normal = loadStats(false);
  const hard = loadStats(true);
  return Math.max(normal.currentStreak, hard.currentStreak);
};

const isCloseCallGuess = (solution: string, guess: string): boolean => {
  const statuses = getGuessStatuses(solution, guess);
  const grayCount = statuses.filter((s) => s === "absent").length;
  const greenCount = statuses.filter((s) => s === "correct").length;
  return grayCount === 1 && greenCount === statuses.length - 1;
};

export const computeNoLetterReuseWin = (guesses: string[]): boolean => {
  if (guesses.length < 3) return false;

  const priorGuesses = guesses.slice(0, -1);
  const seenLettersByPosition = new Map<number, Set<string>>();

  for (const guess of priorGuesses) {
    const normalized = guess.toLowerCase();
    for (let position = 0; position < normalized.length; position++) {
      const letter = normalized[position];
      const seenAtPosition =
        seenLettersByPosition.get(position) ?? new Set<string>();
      if (seenAtPosition.has(letter)) return false;
      seenAtPosition.add(letter);
      seenLettersByPosition.set(position, seenAtPosition);
    }
  }

  return true;
};

export const computeDuckVerticalSpell = (guesses: string[]): boolean => {
  if (guesses.length < 4) return false;

  const normalized = guesses.map((g) => g.toLowerCase());
  const wordLength = normalized[0]?.length ?? 0;

  for (let start = 0; start <= normalized.length - 4; start++) {
    for (let col = 0; col < wordLength; col++) {
      const vertical = normalized
        .slice(start, start + 4)
        .map((g) => g[col])
        .join("");
      if (vertical === "duck") return true;
    }
  }

  return false;
};

export const computeCloseCallStreak = (
  guessHistory: string[],
  solution: string
): boolean => {
  let streak = new Set<string>();

  for (const guess of guessHistory) {
    const normalized = guess.toLowerCase();

    if (isCloseCallGuess(solution, guess)) {
      if (streak.has(normalized)) {
        streak = new Set([normalized]);
      } else {
        streak.add(normalized);
      }
      if (streak.size >= 3) return true;
    } else {
      streak = new Set();
    }
  }

  return false;
};

const computeUniqueWordCount = (p: AchievementProgress): number => {
  if (p.unlockedIds.includes("word_connoisseur")) return 200;
  return loadWordConnoisseurList().length;
};

export const useAchievements = () => {
  const [progress, setProgress] = useState<AchievementProgress>(() =>
    loadAchievementProgress()
  );
  const [uniqueWordCount, setUniqueWordCount] = useState<number>(() =>
    computeUniqueWordCount(loadAchievementProgress())
  );
  const hasRecordedWinRef = useRef(false);

  useStorageSync(ACHIEVEMENTS_KEY, () => {
    const p = loadAchievementProgress();
    setProgress(p);
    setUniqueWordCount(computeUniqueWordCount(p));
  });

  useStorageSync(WORD_CONNOISSEUR_KEY, () => {
    setUniqueWordCount(computeUniqueWordCount(loadAchievementProgress()));
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
      (a) =>
        a.id !== COMPLETIONIST_ID &&
        !base.unlockedIds.includes(a.id) &&
        a.check(ctx)
    );

    next.unlockedIds = [...base.unlockedIds, ...newlyUnlocked.map((a) => a.id)];

    if (newlyUnlocked.some((a) => a.id === "word_connoisseur")) {
      deleteWordConnoisseurList();
      setUniqueWordCount(200);
    }

    setProgress(next);
    saveAchievementProgress(next);

    const result = [...newlyUnlocked];
    if (
      !isCompletionistUnlocked(base.unlockedIds) &&
      isCompletionistUnlocked(next.unlockedIds)
    ) {
      const completionist = ACHIEVEMENTS.find((a) => a.id === COMPLETIONIST_ID);
      if (completionist) result.push(completionist);
    }

    return result;
  };

  const recordWin = (event: WinEvent): Achievement[] => {
    if (hasRecordedWinRef.current) return [];
    hasRecordedWinRef.current = true;

    const base = loadAchievementProgress();
    const next: AchievementProgress = { ...base };
    if (event.hardMode && event.wordLength >= 5) next.wonInHardMode5Plus = true;
    if (event.guessCount <= 5) next.wonIn5GuessesEver = true;
    if (event.wordLength === 7) next.wonWith7LettersEver = true;

    const maxChallenges = event.hardMode
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
    if (event.guessCount === maxChallenges) next.wonOnFinalGuessEver = true;
    if (computeNoLetterReuseWin(event.guesses))
      next.wonWithoutReusingLettersEver = true;

    const ctx: AchievementContext = {
      totalWins: getRealTotalWins(),
      wonInHardMode5Plus: next.wonInHardMode5Plus,
      wonIn5GuessesEver: next.wonIn5GuessesEver,
      wonWith7LettersEver: next.wonWith7LettersEver,
      wonOnFinalGuessEver: next.wonOnFinalGuessEver,
      wonWithoutReusingLettersEver: next.wonWithoutReusingLettersEver,
      lastGuess: "",
      uniqueWordCount,
      gotCloseCallStreak: false,
      bestCurrentStreak: getBestCurrentStreak(),
      spelledDuckVertically: computeDuckVerticalSpell(event.guesses),
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
      [...previousGuesses, word],
      solution
    );

    const spelledDuckVertically = computeDuckVerticalSpell([
      ...previousGuesses,
      word,
    ]);

    const ctx: AchievementContext = {
      totalWins: getRealTotalWins(),
      wonInHardMode5Plus: base.wonInHardMode5Plus,
      wonIn5GuessesEver: base.wonIn5GuessesEver,
      wonWith7LettersEver: base.wonWith7LettersEver,
      wonOnFinalGuessEver: base.wonOnFinalGuessEver,
      wonWithoutReusingLettersEver: base.wonWithoutReusingLettersEver,
      lastGuess: normalized,
      uniqueWordCount: currentUniqueCount,
      gotCloseCallStreak,
      bestCurrentStreak: getBestCurrentStreak(),
      spelledDuckVertically,
    };

    const next: AchievementProgress = { ...base };
    return commitProgress(base, next, ctx);
  };

  return {
    unlockedIds: getEffectiveUnlockedIds(progress.unlockedIds),
    uniqueWordCount,
    recordWin,
    recordGuess,
    resetWinRecord,
  };
};
