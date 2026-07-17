export type AchievementContext = {
  totalWins: number;
  wonInHardMode5Plus: boolean;
  wonIn5GuessesEver: boolean;
  wonWith7LettersEver: boolean;
  wonOnFinalGuessEver: boolean;
  wonWithoutReusingLettersEver: boolean;
  lastGuess: string;
  uniqueWordCount: number;
  gotCloseCallStreak: boolean;
  bestCurrentStreak: number;
  spelledDuckVertically: boolean;
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
};

const defaultProgress = (): AchievementProgress => ({
  unlockedIds: [],
  wonInHardMode5Plus: false,
  wonIn5GuessesEver: false,
  wonWith7LettersEver: false,
  wonOnFinalGuessEver: false,
  wonWithoutReusingLettersEver: false,
});

export const COMPLETIONIST_ID = "completionist";

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_win",
    title: "First Victory",
    description: "Win your first game",
    hidden: false,
    check: (ctx) => ctx.totalWins >= 1,
  },
  {
    id: "win_15",
    title: "Seasoned Player",
    description: "Win 15 games",
    hidden: false,
    check: (ctx) => ctx.totalWins >= 15,
  },
  {
    id: "win_50",
    title: "Veteran",
    description: "Win 50 games",
    hidden: false,
    check: (ctx) => ctx.totalWins >= 50,
  },
  {
    id: "on_a_roll",
    title: "On a Roll",
    description: "Win 5 games in a row",
    hidden: false,
    check: (ctx) => ctx.bestCurrentStreak >= 5,
  },
  {
    id: "unstoppable",
    title: "Unstoppable",
    description: "Win 15 games in a row",
    hidden: false,
    check: (ctx) => ctx.bestCurrentStreak >= 15,
  },
  {
    id: "hard_5plus",
    title: "Hard Core",
    description: "Beat Hard Mode with a word 5 letters or longer",
    hidden: false,
    check: (ctx) => ctx.wonInHardMode5Plus,
  },
  {
    id: "fifth_guess",
    title: "Speed Demon",
    description: "Solve a word in 5 guesses or fewer",
    hidden: true,
    check: (ctx) => ctx.wonIn5GuessesEver,
  },
  {
    id: "seven_letters",
    title: "Heavyweight Champion",
    description: "Win a game with a 7-letter word",
    hidden: false,
    check: (ctx) => ctx.wonWith7LettersEver,
  },
  {
    id: "close_but_no_cigar",
    title: "Close But No Cigar",
    description:
      "Guess 3 different words in a row with only one letter incorrect",
    hidden: true,
    check: (ctx) => ctx.gotCloseCallStreak,
  },
  {
    id: "word_connoisseur",
    title: "Word Connoisseur",
    description: "Guess 200 unique words in normal or hard mode",
    hidden: false,
    check: (ctx) => ctx.uniqueWordCount >= 200,
  },
  {
    id: "quack",
    title: "Quack!",
    description:
      "Spell DUCK vertically down any column across 4 guesses in a row",
    hidden: false,
    check: (ctx) => ctx.spelledDuckVertically,
  },
  {
    id: "guess_mouse",
    title: "Squeak!",
    description: "Type MOUSE as a guess during a game",
    hidden: false,
    check: (ctx) => ctx.lastGuess === "mouse",
  },
  {
    id: "nail_biter",
    title: "Nail-Biter",
    description: "Win a game on your very last guess",
    hidden: true,
    check: (ctx) => ctx.wonOnFinalGuessEver,
  },
  {
    id: "diversify",
    title: "Diversify",
    description:
      "Win in 3+ guesses without repeating a letter's position across your earlier guesses (excluding solution)",
    hidden: false,
    check: (ctx) => ctx.wonWithoutReusingLettersEver,
  },
  {
    id: COMPLETIONIST_ID,
    title: "Completionist",
    description: "Unlock every other achievement",
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
  clearUpdatedAt,
  getUpdatedAt,
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
    stampUpdatedAt(WORD_CONNOISSEUR_KEY);
  } catch {}
};

export const getWordConnoisseurUpdatedAt = (): string | null =>
  getUpdatedAt(WORD_CONNOISSEUR_KEY);

export const deleteWordConnoisseurList = (): void => {
  try {
    localStorage.removeItem(WORD_CONNOISSEUR_KEY);
    clearUpdatedAt(WORD_CONNOISSEUR_KEY);
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
    stampUpdatedAt(ACHIEVEMENTS_KEY);
  } catch {}
};

export const getAchievementProgressUpdatedAt = (): string | null =>
  getUpdatedAt(ACHIEVEMENTS_KEY);
