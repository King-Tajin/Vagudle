import { ACHIEVEMENT_TEXT } from "../constants/strings";

export type AchievementContext = {
  totalWins: number;
  wonInHardMode5Plus: boolean;
  wonIn5GuessesEver: boolean;
  wonWith7LettersEver: boolean;
  wonOnFinalGuessEver: boolean;
  wonWithoutReusingLettersEver: boolean;
  wonWithMostlyGraysEver: boolean;
  lastGuess: string;
  uniqueWordCount: number;
  gotCloseCallStreak: boolean;
  bestCurrentStreak: number;
  spelledDuckVertically: boolean;
  gotAllGrayStreak: boolean;
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  hidden: boolean;
  check: (ctx: AchievementContext) => boolean;
};

export type AchievementProgress = {
  unlockedIds: string[];
  wonInHardMode5Plus: boolean;
  wonIn5GuessesEver: boolean;
  wonWith7LettersEver: boolean;
  wonOnFinalGuessEver: boolean;
  wonWithoutReusingLettersEver: boolean;
  wonWithMostlyGraysEver: boolean;
};

const defaultProgress = (): AchievementProgress => ({
  unlockedIds: [],
  wonInHardMode5Plus: false,
  wonIn5GuessesEver: false,
  wonWith7LettersEver: false,
  wonOnFinalGuessEver: false,
  wonWithoutReusingLettersEver: false,
  wonWithMostlyGraysEver: false,
});

export const COMPLETIONIST_ID = "completionist";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    ...ACHIEVEMENT_TEXT.first_win,
    hidden: false,
    check: (ctx) => ctx.totalWins >= 1,
  },
  {
    id: "win_15",
    ...ACHIEVEMENT_TEXT.win_15,
    hidden: false,
    check: (ctx) => ctx.totalWins >= 15,
  },
  {
    id: "win_50",
    ...ACHIEVEMENT_TEXT.win_50,
    hidden: false,
    check: (ctx) => ctx.totalWins >= 50,
  },
  {
    id: "on_a_roll",
    ...ACHIEVEMENT_TEXT.on_a_roll,
    hidden: false,
    check: (ctx) => ctx.bestCurrentStreak >= 5,
  },
  {
    id: "unstoppable",
    ...ACHIEVEMENT_TEXT.unstoppable,
    hidden: false,
    check: (ctx) => ctx.bestCurrentStreak >= 15,
  },
  {
    id: "hard_5plus",
    ...ACHIEVEMENT_TEXT.hard_5plus,
    hidden: false,
    check: (ctx) => ctx.wonInHardMode5Plus,
  },
  {
    id: "fifth_guess",
    ...ACHIEVEMENT_TEXT.fifth_guess,
    hidden: true,
    check: (ctx) => ctx.wonIn5GuessesEver,
  },
  {
    id: "seven_letters",
    ...ACHIEVEMENT_TEXT.seven_letters,
    hidden: false,
    check: (ctx) => ctx.wonWith7LettersEver,
  },
  {
    id: "close_but_no_cigar",
    ...ACHIEVEMENT_TEXT.close_but_no_cigar,
    hidden: true,
    check: (ctx) => ctx.gotCloseCallStreak,
  },
  {
    id: "process_of_elimination",
    ...ACHIEVEMENT_TEXT.process_of_elimination,
    hidden: false,
    check: (ctx) => ctx.gotAllGrayStreak,
  },
  {
    id: "word_connoisseur",
    ...ACHIEVEMENT_TEXT.word_connoisseur,
    hidden: false,
    check: (ctx) => ctx.uniqueWordCount >= 200,
  },
  {
    id: "quack",
    ...ACHIEVEMENT_TEXT.quack,
    hidden: false,
    check: (ctx) => ctx.spelledDuckVertically,
  },
  {
    id: "guess_mouse",
    ...ACHIEVEMENT_TEXT.guess_mouse,
    hidden: false,
    check: (ctx) => ctx.lastGuess === "mouse",
  },
  {
    id: "nail_biter",
    ...ACHIEVEMENT_TEXT.nail_biter,
    hidden: true,
    check: (ctx) => ctx.wonOnFinalGuessEver,
  },
  {
    id: "diversify",
    ...ACHIEVEMENT_TEXT.diversify,
    hidden: false,
    check: (ctx) => ctx.wonWithoutReusingLettersEver,
  },
  {
    id: "blind_faith",
    ...ACHIEVEMENT_TEXT.blind_faith,
    hidden: true,
    check: (ctx) => ctx.wonWithMostlyGraysEver,
  },
  {
    id: COMPLETIONIST_ID,
    ...ACHIEVEMENT_TEXT.completionist,
    hidden: false,
    check: () => false,
  },
];

export const isCompletionistUnlocked = (unlockedIds: string[]): boolean => {
  const unlockedSet = new Set(unlockedIds);
  return ACHIEVEMENTS.filter((a) => a.id !== COMPLETIONIST_ID).every((a) =>
    unlockedSet.has(a.id)
  );
};

export const getEffectiveUnlockedIds = (unlockedIds: string[]): string[] => {
  if (
    !unlockedIds.includes(COMPLETIONIST_ID) &&
    isCompletionistUnlocked(unlockedIds)
  ) {
    return [...unlockedIds, COMPLETIONIST_ID];
  }
  return unlockedIds;
};

import {
  migrateLegacyStorageKey,
  stampUpdatedAt,
  cloudSyncKey,
} from "./localStorage";

export const ACHIEVEMENTS_KEY = "vagudle-achievements:v1";
const LEGACY_ACHIEVEMENTS_KEY = "vagudle-achievements";
export const WORD_CONNOISSEUR_KEY = "vagudle-word-connoisseur:v1";
const LEGACY_WORD_CONNOISSEUR_KEY = "vagudle-word-connoisseur";

export const loadWordConnoisseurList = (): string[] => {
  migrateLegacyStorageKey(LEGACY_WORD_CONNOISSEUR_KEY, WORD_CONNOISSEUR_KEY);
  try {
    const stored = localStorage.getItem(WORD_CONNOISSEUR_KEY);
    return stored ? (JSON.parse(stored) as string[]) : [];
  } catch {
    return [];
  }
};

export const saveWordConnoisseurList = (words: string[]): void => {
  try {
    localStorage.setItem(WORD_CONNOISSEUR_KEY, JSON.stringify(words));
    stampUpdatedAt(cloudSyncKey);
  } catch {}
};

export const deleteWordConnoisseurList = (): void => {
  try {
    localStorage.removeItem(WORD_CONNOISSEUR_KEY);
  } catch {}
};

export const loadAchievementProgress = (): AchievementProgress => {
  migrateLegacyStorageKey(LEGACY_ACHIEVEMENTS_KEY, ACHIEVEMENTS_KEY);
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Partial<AchievementProgress>;
      return { ...defaultProgress(), ...parsed };
    }
  } catch {}
  return defaultProgress();
};

export const saveAchievementProgress = (p: AchievementProgress): void => {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(p));
    stampUpdatedAt(cloudSyncKey);
  } catch {}
};
