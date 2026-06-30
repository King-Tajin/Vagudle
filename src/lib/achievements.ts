export type AchievementContext = {
  totalWins: number;
  wonInHardMode5Plus: boolean;
  wonIn5GuessesEver: boolean;
  wonWith7LettersEver: boolean;
  lastGuess: string;
  uniqueWordCount: number;
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
};

const defaultProgress = (): AchievementProgress => ({
  unlockedIds: [],
  wonInHardMode5Plus: false,
  wonIn5GuessesEver: false,
  wonWith7LettersEver: false,
});

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
    id: "word_connoisseur",
    title: "Word Connoisseur",
    description: "Guess 200 unique words in normal or hard mode",
    hidden: false,
    check: (ctx) => ctx.uniqueWordCount >= 200,
  },
  {
    id: "guess_mouse",
    title: "Squeak!",
    description: "Type MOUSE as a guess during a game",
    hidden: false,
    check: (ctx) => ctx.lastGuess === "mouse",
  },
];

export const ACHIEVEMENTS_KEY = "vagudle-achievements";
export const WORD_CONNOISSEUR_KEY = "vagudle-word-connoisseur";

export const loadWordConnoisseurList = (): string[] => {
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
  } catch {}
};

export const deleteWordConnoisseurList = (): void => {
  try {
    localStorage.removeItem(WORD_CONNOISSEUR_KEY);
  } catch {}
};

export const loadAchievementProgress = (): AchievementProgress => {
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
  } catch {}
};
