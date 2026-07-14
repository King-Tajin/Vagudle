export const gameStateKey = "gameState";

type StoredGameState = {
  guesses: string[];
  solution: string;
  cellColors: { [key: string]: string };
  autoGrayLetters?: string[];
  hardMode?: boolean;
};

export const saveGameStateToLocalStorage = (gameState: StoredGameState) => {
  try {
    localStorage.setItem(gameStateKey, JSON.stringify(gameState));
  } catch {}
};

export const loadGameStateFromLocalStorage = (): StoredGameState | null => {
  try {
    const state = localStorage.getItem(gameStateKey);
    return state ? (JSON.parse(state) as StoredGameState) : null;
  } catch {
    localStorage.removeItem(gameStateKey);
    return null;
  }
};

export const settingsKey = "settings";

type StoredSettings = {
  wordLength: number;
  showGrayCount: boolean;
  hardMode: boolean;
  autoGray: boolean;
  autoGreen: boolean;
  extraEffects: boolean;
};

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const defaultSettings: StoredSettings = {
  wordLength: 5,
  showGrayCount: true,
  hardMode: false,
  autoGray: true,
  autoGreen: false,
  extraEffects: !prefersReducedMotion(),
};

export const saveSettingsToLocalStorage = (settings: StoredSettings) => {
  try {
    localStorage.setItem(settingsKey, JSON.stringify(settings));
  } catch {}
};

export const loadSettingsFromLocalStorage = (): StoredSettings => {
  try {
    const stored = localStorage.getItem(settingsKey);
    return stored
      ? {
          ...defaultSettings,
          ...(JSON.parse(stored) as Partial<StoredSettings>),
        }
      : defaultSettings;
  } catch {
    localStorage.removeItem(settingsKey);
    return defaultSettings;
  }
};

export const normalStatKey = "gameStats";
export const hardStatKey = "gameStatsHard";

export type GameStats = {
  winDistribution: number[];
  gamesFailed: number;
  currentStreak: number;
  bestStreak: number;
  totalGames: number;
  successRate: number;
};

export const saveStatsToLocalStorage = (
  gameStats: GameStats,
  hardMode: boolean
) => {
  try {
    localStorage.setItem(
      hardMode ? hardStatKey : normalStatKey,
      JSON.stringify(gameStats)
    );
  } catch {}
};

export const loadStatsFromLocalStorage = (
  hardMode: boolean
): GameStats | null => {
  try {
    const stats = localStorage.getItem(hardMode ? hardStatKey : normalStatKey);
    return stats ? (JSON.parse(stats) as GameStats) : null;
  } catch {
    localStorage.removeItem(hardMode ? hardStatKey : normalStatKey);
    return null;
  }
};
