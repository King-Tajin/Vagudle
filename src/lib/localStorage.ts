export const migrateLegacyStorageKey = (legacyKey: string, newKey: string) => {
  try {
    if (localStorage.getItem(newKey) !== null) return;
    const legacyValue = localStorage.getItem(legacyKey);
    if (legacyValue === null) return;
    localStorage.setItem(newKey, legacyValue);
    localStorage.removeItem(legacyKey);
  } catch {}
};

const updatedAtKey = (key: string) => `${key}:updatedAt`;

export const stampUpdatedAt = (key: string) => {
  try {
    localStorage.setItem(updatedAtKey(key), new Date().toISOString());
  } catch {}
};

export const clearUpdatedAt = (key: string) => {
  try {
    localStorage.removeItem(updatedAtKey(key));
  } catch {}
};

export const getUpdatedAt = (key: string): string | null => {
  try {
    return localStorage.getItem(updatedAtKey(key));
  } catch {
    return null;
  }
};

export const dispatchStorageSync = (key: string) => {
  try {
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        newValue: localStorage.getItem(key),
        storageArea: localStorage,
      })
    );
  } catch {}
};

export const gameStateKey = "gameState:v1";
const legacyGameStateKey = "gameState";

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
  migrateLegacyStorageKey(legacyGameStateKey, gameStateKey);
  try {
    const state = localStorage.getItem(gameStateKey);
    return state ? (JSON.parse(state) as StoredGameState) : null;
  } catch {
    localStorage.removeItem(gameStateKey);
    return null;
  }
};

export const settingsKey = "settings:v1";
const legacySettingsKey = "settings";

export type StoredSettings = {
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
    stampUpdatedAt(settingsKey);
  } catch {}
};

export const getSettingsUpdatedAt = (): string | null =>
  getUpdatedAt(settingsKey);

export const loadSettingsFromLocalStorage = (): StoredSettings => {
  migrateLegacyStorageKey(legacySettingsKey, settingsKey);
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

export const normalStatKey = "gameStats:v1";
export const hardStatKey = "gameStatsHard:v1";
const legacyNormalStatKey = "gameStats";
const legacyHardStatKey = "gameStatsHard";

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
    const key = hardMode ? hardStatKey : normalStatKey;
    localStorage.setItem(key, JSON.stringify(gameStats));
    stampUpdatedAt(key);
  } catch {}
};

export const getStatsUpdatedAt = (hardMode: boolean): string | null =>
  getUpdatedAt(hardMode ? hardStatKey : normalStatKey);

export const loadStatsFromLocalStorage = (
  hardMode: boolean
): GameStats | null => {
  migrateLegacyStorageKey(
    hardMode ? legacyHardStatKey : legacyNormalStatKey,
    hardMode ? hardStatKey : normalStatKey
  );
  try {
    const stats = localStorage.getItem(hardMode ? hardStatKey : normalStatKey);
    return stats ? (JSON.parse(stats) as GameStats) : null;
  } catch {
    localStorage.removeItem(hardMode ? hardStatKey : normalStatKey);
    return null;
  }
};
