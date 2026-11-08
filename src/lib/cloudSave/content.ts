import {
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage,
  loadStatsFromLocalStorage,
  saveStatsToLocalStorage,
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  dispatchStorageSync,
  settingsKey,
  normalStatKey,
  hardStatKey,
  gameStateKey,
} from "../localStorage";
import {
  loadAchievementProgress,
  saveAchievementProgress,
  loadWordConnoisseurList,
  saveWordConnoisseurList,
  ACHIEVEMENTS_KEY,
  WORD_CONNOISSEUR_KEY,
} from "../achievements";
import {
  loadExplicitBackgroundId,
  saveBackgroundId,
  BG_KEY,
  type BackgroundId,
} from "../backgrounds";
import { getRandomWord } from "../words";
import { loadDailyStats, saveDailyStats, dailyStatsKey } from "../daily";
import {
  getLastPlayedAt,
  recordLastPlayedAt,
  getOrInitFirstSeenAt,
  setFirstSeenAt,
  LAST_PLAYED_AT_KEY,
  FIRST_SEEN_AT_KEY,
} from "../activity";
import {
  canonicalContent,
  canonicalSettings,
  serializeValue,
} from "./canonical";
import type {
  ActivityStamps,
  DeferredKey,
  DeferredKeys,
  LocalSnapshot,
  SyncContent,
} from "./types";

const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hasActiveGuesses = (): boolean =>
  (loadGameStateFromLocalStorage()?.guesses.length ?? 0) > 0;

export const getDeferredKeys = (): DeferredKeys => {
  const keys = new Set<DeferredKey>();
  if (hasActiveGuesses()) {
    keys.add("wordLength");
    keys.add("hardMode");
  }
  if (prefersReducedMotion()) keys.add("extraEffects");
  return keys;
};

export const readLocalSnapshot = (): LocalSnapshot => {
  const { language, ...settings } = loadSettingsFromLocalStorage();
  return {
    content: canonicalContent({
      achievements: loadAchievementProgress(),
      wordConnoisseur: loadWordConnoisseurList(),
      statsNormal: loadStatsFromLocalStorage(false),
      statsHard: loadStatsFromLocalStorage(true),
      dailyStats: loadDailyStats(),
      settings,
      backgroundId: loadExplicitBackgroundId(),
    }),
    activity: {
      lastPlayedAt: getLastPlayedAt()?.toISOString() ?? null,
      firstSeenAt: getOrInitFirstSeenAt().toISOString(),
    },
    language,
  };
};

const isValidDate = (value: string): boolean =>
  !Number.isNaN(new Date(value).getTime());

export const applyContentToLocal = (
  content: SyncContent,
  activity: ActivityStamps,
  deferred: DeferredKeys
): void => {
  const current = readLocalSnapshot();

  if (
    serializeValue(current.content.achievements) !==
    serializeValue(content.achievements)
  ) {
    saveAchievementProgress(content.achievements);
    dispatchStorageSync(ACHIEVEMENTS_KEY);
  }

  if (
    serializeValue(current.content.wordConnoisseur) !==
    serializeValue(content.wordConnoisseur)
  ) {
    saveWordConnoisseurList(content.wordConnoisseur);
    dispatchStorageSync(WORD_CONNOISSEUR_KEY);
  }

  if (
    serializeValue(current.content.statsNormal) !==
    serializeValue(content.statsNormal)
  ) {
    saveStatsToLocalStorage(content.statsNormal, false);
    dispatchStorageSync(normalStatKey);
  }

  if (
    serializeValue(current.content.statsHard) !==
    serializeValue(content.statsHard)
  ) {
    saveStatsToLocalStorage(content.statsHard, true);
    dispatchStorageSync(hardStatKey);
  }

  if (
    serializeValue(current.content.dailyStats) !==
    serializeValue(content.dailyStats)
  ) {
    saveDailyStats(content.dailyStats);
    dispatchStorageSync(dailyStatsKey);
  }

  const localSettings = loadSettingsFromLocalStorage();
  const incoming: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(content.settings)) {
    if (value !== undefined && !deferred.has(key as DeferredKey))
      incoming[key] = value;
  }
  const nextSettings = { ...localSettings, ...incoming };
  if (
    serializeValue(canonicalSettings(localSettings)) !==
    serializeValue(canonicalSettings(nextSettings))
  ) {
    const activeGuesses = hasActiveGuesses();
    saveSettingsToLocalStorage(nextSettings);
    dispatchStorageSync(settingsKey);

    const puzzleSettingsChanged =
      nextSettings.wordLength !== localSettings.wordLength ||
      nextSettings.hardMode !== localSettings.hardMode;
    if (!activeGuesses && puzzleSettingsChanged) {
      saveGameStateToLocalStorage({
        guesses: [],
        solution: getRandomWord(nextSettings.wordLength, nextSettings.hardMode),
        cellColors: {},
        autoGrayLetters: [],
        hardMode: nextSettings.hardMode,
      });
      dispatchStorageSync(gameStateKey);
    }
  }

  if (
    content.backgroundId !== null &&
    content.backgroundId !== current.content.backgroundId
  ) {
    saveBackgroundId(content.backgroundId as BackgroundId);
    dispatchStorageSync(BG_KEY);
  }

  if (
    activity.lastPlayedAt &&
    activity.lastPlayedAt !== current.activity.lastPlayedAt &&
    isValidDate(activity.lastPlayedAt)
  ) {
    recordLastPlayedAt(new Date(activity.lastPlayedAt));
    dispatchStorageSync(LAST_PLAYED_AT_KEY);
  }

  if (
    activity.firstSeenAt &&
    activity.firstSeenAt !== current.activity.firstSeenAt &&
    isValidDate(activity.firstSeenAt)
  ) {
    setFirstSeenAt(new Date(activity.firstSeenAt));
    dispatchStorageSync(FIRST_SEEN_AT_KEY);
  }
};
