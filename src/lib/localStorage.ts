const gameStateKey = "gameState";

type StoredGameState = {
  guesses: string[];
  solution: string;
  cellColors: { [key: string]: string };
  autoGrayLetters?: string[];
  hardMode?: boolean;
};

export const saveGameStateToLocalStorage = (gameState: StoredGameState) => {
  localStorage.setItem(gameStateKey, JSON.stringify(gameState));
};

export const loadGameStateFromLocalStorage = () => {
  const state = localStorage.getItem(gameStateKey);
  return state ? (JSON.parse(state) as StoredGameState) : null;
};

const settingsKey = "settings";

type StoredSettings = {
  wordLength: number;
  showGrayCount: boolean;
  hardMode: boolean;
  autoGray: boolean;
  autoGreen: boolean;
};

export const saveSettingsToLocalStorage = (settings: StoredSettings) => {
  localStorage.setItem(settingsKey, JSON.stringify(settings));
};

export const loadSettingsFromLocalStorage = (): StoredSettings => {
  const stored = localStorage.getItem(settingsKey);
  return stored
    ? (JSON.parse(stored) as StoredSettings)
    : {
        wordLength: 5,
        showGrayCount: false,
        hardMode: false,
        autoGray: false,
        autoGreen: false,
      };
};

const normalStatKey = "gameStats";
const hardStatKey = "gameStatsHard";

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
  localStorage.setItem(
    hardMode ? hardStatKey : normalStatKey,
    JSON.stringify(gameStats)
  );
};

export const loadStatsFromLocalStorage = (hardMode: boolean) => {
  const stats = localStorage.getItem(hardMode ? hardStatKey : normalStatKey);
  return stats ? (JSON.parse(stats) as GameStats) : null;
};
