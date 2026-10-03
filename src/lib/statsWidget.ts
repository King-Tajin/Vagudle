import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../constants/settings";
import type { GameStats } from "./localStorage";

const BUCKET_COUNT = 6;

export type StatsWidgetInput = {
  normal: GameStats;
  hard: GameStats;
};

const toCount = (value: number | undefined) =>
  Number.isFinite(value) ? Math.max(value ?? 0, 0) : 0;

const buildModePayload = (
  stats: GameStats,
  maxChallenges: number
): StatsWidgetModePayload => {
  const firstBucketMax = maxChallenges - BUCKET_COUNT + 1;
  const counts = Array.from({ length: maxChallenges }, (_, index) =>
    toCount(stats.winDistribution[index])
  );
  const distribution = [
    counts.slice(0, firstBucketMax).reduce((sum, count) => sum + count, 0),
    ...counts.slice(firstBucketMax),
  ];

  return {
    totalGames: toCount(stats.totalGames),
    successRate: Math.min(toCount(stats.successRate), 100),
    currentStreak: toCount(stats.currentStreak),
    bestStreak: toCount(stats.bestStreak),
    firstBucketMax,
    distribution,
  };
};

export const buildStatsWidgetPayload = (
  input: StatsWidgetInput
): StatsWidgetSyncPayload => ({
  normal: buildModePayload(input.normal, NORMAL_MODE_MAX_CHALLENGES),
  hard: buildModePayload(input.hard, HARD_MODE_MAX_CHALLENGES),
});
