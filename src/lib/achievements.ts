export type AchievementContext = {
  totalWins: number;
  wonInHardMode5Plus: boolean;
  wonIn5GuessesEver: boolean;
  wonWith7LettersEver: boolean;
  guessedWords: string[];
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
  totalWins: number;
  wonInHardMode5Plus: boolean;
  wonIn5GuessesEver: boolean;
  wonWith7LettersEver: boolean;
  guessedWords: string[];
};

type StoredProgress = Partial<AchievementProgress> & {
  totalRegularWins?: number;
};

const defaultProgress = (): AchievementProgress => ({
  unlockedIds: [],
  totalWins: 0,
  wonInHardMode5Plus: false,
  wonIn5GuessesEver: false,
  wonWith7LettersEver: false,
  guessedWords: [],
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
    id: "guess_mouse",
    title: "Squeak!",
    description: "Type MOUSE as a guess during a game",
    hidden: false,
    check: (ctx) => ctx.guessedWords.includes("mouse"),
  },
];

export const ACHIEVEMENTS_KEY = "vagudle-achievements";

export const loadAchievementProgress = (): AchievementProgress => {
  try {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as StoredProgress;
      const progress: AchievementProgress = { ...defaultProgress(), ...parsed };
      if (
        progress.totalWins === 0 &&
        typeof parsed.totalRegularWins === "number"
      ) {
        progress.totalWins = parsed.totalRegularWins;
      }
      return progress;
    }
  } catch {}
  return defaultProgress();
};

export const saveAchievementProgress = (p: AchievementProgress): void => {
  try {
    localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(p));
  } catch {}
};
