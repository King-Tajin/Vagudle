import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../../constants/settings";
import type { GameStats } from "../localStorage";
import type { DailyStats } from "../daily";
import type { AchievementProgress } from "../achievements";
import type { RawSyncContent, SyncContent, SyncedSettings } from "./types";

const toCount = (value: unknown): number =>
  typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.floor(value))
    : 0;

export const getSuccessRate = (
  totalGames: number,
  gamesFailed: number
): number =>
  Math.round((100 * (totalGames - gamesFailed)) / Math.max(totalGames, 1));

const uniqueSorted = (values: unknown[]): string[] =>
  Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string")
    )
  ).sort();

export const canonicalStats = (
  stats: Partial<GameStats> | null | undefined,
  hardMode: boolean
): GameStats => {
  const minimumLength = hardMode
    ? HARD_MODE_MAX_CHALLENGES
    : NORMAL_MODE_MAX_CHALLENGES;
  const source: unknown[] =
    stats && Array.isArray(stats.winDistribution) ? stats.winDistribution : [];
  const length = Math.max(minimumLength, source.length);
  const totalGames = toCount(stats?.totalGames);
  const gamesFailed = toCount(stats?.gamesFailed);
  return {
    winDistribution: Array.from({ length }, (_, index) =>
      toCount(source[index])
    ),
    gamesFailed,
    currentStreak: toCount(stats?.currentStreak),
    bestStreak: toCount(stats?.bestStreak),
    totalGames,
    successRate: getSuccessRate(totalGames, gamesFailed),
  };
};

export const canonicalDaily = (
  daily: Partial<DailyStats> | null | undefined
): DailyStats => ({
  currentStreak: toCount(daily?.currentStreak),
  bestStreak: toCount(daily?.bestStreak),
  totalPlayed: toCount(daily?.totalPlayed),
  totalWon: toCount(daily?.totalWon),
  lastCompletedDate:
    typeof daily?.lastCompletedDate === "string" && daily.lastCompletedDate
      ? daily.lastCompletedDate
      : null,
});

export const canonicalAchievements = (
  achievements: Partial<AchievementProgress> | null | undefined
): AchievementProgress => ({
  unlockedIds: uniqueSorted(
    achievements && Array.isArray(achievements.unlockedIds)
      ? achievements.unlockedIds
      : []
  ),
  wonInHardMode5Plus: achievements?.wonInHardMode5Plus === true,
  wonIn5GuessesEver: achievements?.wonIn5GuessesEver === true,
  wonWith7LettersEver: achievements?.wonWith7LettersEver === true,
  wonOnFinalGuessEver: achievements?.wonOnFinalGuessEver === true,
  wonWithoutReusingLettersEver:
    achievements?.wonWithoutReusingLettersEver === true,
  wonWithMostlyGraysEver: achievements?.wonWithMostlyGraysEver === true,
});

export const canonicalSettings = (
  settings: Record<string, unknown> | null | undefined
): SyncedSettings => {
  const result: Record<string, unknown> = {};
  if (settings) {
    for (const [key, value] of Object.entries(settings)) {
      if (key !== "language" && value !== undefined) result[key] = value;
    }
  }
  return result;
};

export const canonicalContent = (input: RawSyncContent): SyncContent => ({
  achievements: canonicalAchievements(input.achievements),
  wordConnoisseur: uniqueSorted(
    Array.isArray(input.wordConnoisseur) ? input.wordConnoisseur : []
  ),
  statsNormal: canonicalStats(input.statsNormal, false),
  statsHard: canonicalStats(input.statsHard, true),
  dailyStats: canonicalDaily(input.dailyStats),
  settings: canonicalSettings(input.settings),
  backgroundId:
    typeof input.backgroundId === "string" && input.backgroundId
      ? input.backgroundId
      : null,
});

export const emptyContent = (): SyncContent => canonicalContent({});

const sortValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sortValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([key, entry]) => [key, sortValue(entry)])
    );
  }
  return value;
};

export const serializeValue = (value: unknown): string =>
  JSON.stringify(sortValue(value));

export const serializeContent = (content: SyncContent): string =>
  serializeValue(canonicalContent(content));

export const contentEquals = (a: SyncContent, b: SyncContent): boolean =>
  serializeContent(a) === serializeContent(b);
