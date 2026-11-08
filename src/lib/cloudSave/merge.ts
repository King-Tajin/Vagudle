import type { GameStats } from "../localStorage";
import type { DailyStats } from "../daily";
import type { AchievementProgress } from "../achievements";
import { canonicalContent, getSuccessRate } from "./canonical";
import type {
  ActivityStamps,
  DeferredKey,
  DeferredKeys,
  SyncContent,
  SyncedSettings,
} from "./types";

const delta = (side: number, base: number): number => Math.max(0, side - base);

const addDeltas = (base: number, local: number, cloud: number): number =>
  base + delta(local, base) + delta(cloud, base);

const elementAt = (values: number[], index: number): number =>
  values[index] ?? 0;

const mergeStats = (
  base: GameStats,
  local: GameStats,
  cloud: GameStats,
  localIsLater: boolean
): GameStats => {
  const length = Math.max(
    base.winDistribution.length,
    local.winDistribution.length,
    cloud.winDistribution.length
  );
  const winDistribution = Array.from({ length }, (_, index) =>
    addDeltas(
      elementAt(base.winDistribution, index),
      elementAt(local.winDistribution, index),
      elementAt(cloud.winDistribution, index)
    )
  );
  const totalGames = addDeltas(
    base.totalGames,
    local.totalGames,
    cloud.totalGames
  );
  const gamesFailed = addDeltas(
    base.gamesFailed,
    local.gamesFailed,
    cloud.gamesFailed
  );
  const localLost = local.gamesFailed > base.gamesFailed;
  const cloudLost = cloud.gamesFailed > base.gamesFailed;
  const currentStreak =
    !localLost && !cloudLost
      ? addDeltas(base.currentStreak, local.currentStreak, cloud.currentStreak)
      : localIsLater
        ? local.currentStreak
        : cloud.currentStreak;
  const bestStreak = Math.max(
    base.bestStreak,
    local.bestStreak,
    cloud.bestStreak,
    currentStreak
  );
  return {
    winDistribution,
    gamesFailed,
    currentStreak,
    bestStreak,
    totalGames,
    successRate: getSuccessRate(totalGames, gamesFailed),
  };
};

const latestDate = (...dates: (string | null)[]): string | null =>
  dates.reduce<string | null>(
    (latest, date) => (date && (!latest || date > latest) ? date : latest),
    null
  );

const streakFromLaterSide = (local: DailyStats, cloud: DailyStats): number => {
  const localDate = local.lastCompletedDate ?? "";
  const cloudDate = cloud.lastCompletedDate ?? "";
  if (localDate > cloudDate) return local.currentStreak;
  if (cloudDate > localDate) return cloud.currentStreak;
  return Math.max(local.currentStreak, cloud.currentStreak);
};

const mergeDaily = (
  base: DailyStats,
  local: DailyStats,
  cloud: DailyStats
): DailyStats => {
  const sameDay =
    local.lastCompletedDate !== null &&
    local.lastCompletedDate === cloud.lastCompletedDate &&
    local.lastCompletedDate !== base.lastCompletedDate;
  const totalPlayed = sameDay
    ? Math.max(local.totalPlayed, cloud.totalPlayed)
    : addDeltas(base.totalPlayed, local.totalPlayed, cloud.totalPlayed);
  const totalWon = sameDay
    ? Math.max(local.totalWon, cloud.totalWon)
    : addDeltas(base.totalWon, local.totalWon, cloud.totalWon);
  const currentStreak = streakFromLaterSide(local, cloud);
  return {
    currentStreak,
    bestStreak: Math.max(
      base.bestStreak,
      local.bestStreak,
      cloud.bestStreak,
      currentStreak
    ),
    totalPlayed,
    totalWon,
    lastCompletedDate: latestDate(
      base.lastCompletedDate,
      local.lastCompletedDate,
      cloud.lastCompletedDate
    ),
  };
};

const unionSorted = (a: string[], b: string[]): string[] =>
  Array.from(new Set([...a, ...b])).sort();

const mergeAchievements = (
  a: AchievementProgress,
  b: AchievementProgress
): AchievementProgress => ({
  unlockedIds: unionSorted(a.unlockedIds, b.unlockedIds),
  wonInHardMode5Plus: a.wonInHardMode5Plus || b.wonInHardMode5Plus,
  wonIn5GuessesEver: a.wonIn5GuessesEver || b.wonIn5GuessesEver,
  wonWith7LettersEver: a.wonWith7LettersEver || b.wonWith7LettersEver,
  wonOnFinalGuessEver: a.wonOnFinalGuessEver || b.wonOnFinalGuessEver,
  wonWithoutReusingLettersEver:
    a.wonWithoutReusingLettersEver || b.wonWithoutReusingLettersEver,
  wonWithMostlyGraysEver: a.wonWithMostlyGraysEver || b.wonWithMostlyGraysEver,
});

const mergeScalar = <T>(
  hasBase: boolean,
  base: T | undefined,
  local: T | undefined,
  cloud: T | undefined
): T | undefined => {
  if (!hasBase) return cloud !== undefined ? cloud : local;
  const localChanged = local !== base;
  const cloudChanged = cloud !== base;
  if (localChanged) return local;
  if (cloudChanged) return cloud;
  return local;
};

const mergeSettings = (
  base: SyncedSettings | null,
  local: SyncedSettings,
  cloud: SyncedSettings
): SyncedSettings => {
  const keys = new Set<string>([
    ...Object.keys(local),
    ...Object.keys(cloud),
    ...Object.keys(base ?? {}),
  ]);
  const result: Record<string, unknown> = {};
  const baseRecord = (base ?? {}) as Record<string, unknown>;
  const localRecord = local as Record<string, unknown>;
  const cloudRecord = cloud as Record<string, unknown>;
  for (const key of keys) {
    const value = mergeScalar(
      base !== null,
      baseRecord[key],
      localRecord[key],
      cloudRecord[key]
    );
    if (value !== undefined) result[key] = value;
  }
  return result;
};

const parseTime = (value: string | null): number | null => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

export const isLocalActivityLater = (
  local: ActivityStamps,
  cloud: ActivityStamps
): boolean => {
  const localTime = parseTime(local.lastPlayedAt);
  const cloudTime = parseTime(cloud.lastPlayedAt);
  if (localTime === null) return cloudTime === null;
  if (cloudTime === null) return true;
  return localTime >= cloudTime;
};

export const mergeActivity = (
  local: ActivityStamps,
  cloud: ActivityStamps
): ActivityStamps => {
  const pick = (
    a: string | null,
    b: string | null,
    prefer: "max" | "min"
  ): string | null => {
    const aTime = parseTime(a);
    const bTime = parseTime(b);
    if (aTime === null) return bTime === null ? null : b;
    if (bTime === null) return a;
    if (prefer === "max") return aTime >= bTime ? a : b;
    return aTime <= bTime ? a : b;
  };
  return {
    lastPlayedAt: pick(local.lastPlayedAt, cloud.lastPlayedAt, "max"),
    firstSeenAt: pick(local.firstSeenAt, cloud.firstSeenAt, "min"),
  };
};

export const mergeContent = (input: {
  base: SyncContent | null;
  local: SyncContent;
  cloud: SyncContent;
  localIsLater: boolean;
}): SyncContent => {
  const local = canonicalContent(input.local);
  const cloud = canonicalContent(input.cloud);
  const base = canonicalContent(input.base ?? {});
  const hasBase = input.base !== null;
  return {
    achievements: mergeAchievements(local.achievements, cloud.achievements),
    wordConnoisseur: unionSorted(local.wordConnoisseur, cloud.wordConnoisseur),
    statsNormal: mergeStats(
      base.statsNormal,
      local.statsNormal,
      cloud.statsNormal,
      input.localIsLater
    ),
    statsHard: mergeStats(
      base.statsHard,
      local.statsHard,
      cloud.statsHard,
      input.localIsLater
    ),
    dailyStats: mergeDaily(base.dailyStats, local.dailyStats, cloud.dailyStats),
    settings: mergeSettings(
      hasBase ? base.settings : null,
      local.settings,
      cloud.settings
    ),
    backgroundId: hasBase
      ? (mergeScalar<string | null>(
          true,
          base.backgroundId,
          local.backgroundId,
          cloud.backgroundId
        ) ?? null)
      : (cloud.backgroundId ?? local.backgroundId),
  };
};

const maxStats = (a: GameStats, b: GameStats): GameStats => {
  const length = Math.max(a.winDistribution.length, b.winDistribution.length);
  const totalGames = Math.max(a.totalGames, b.totalGames);
  const gamesFailed = Math.max(a.gamesFailed, b.gamesFailed);
  return {
    winDistribution: Array.from({ length }, (_, index) =>
      Math.max(
        elementAt(a.winDistribution, index),
        elementAt(b.winDistribution, index)
      )
    ),
    gamesFailed,
    currentStreak: Math.max(a.currentStreak, b.currentStreak),
    bestStreak: Math.max(a.bestStreak, b.bestStreak),
    totalGames,
    successRate: getSuccessRate(totalGames, gamesFailed),
  };
};

export const combineContent = (
  localInput: SyncContent,
  cloudInput: SyncContent
): SyncContent => {
  const local = canonicalContent(localInput);
  const cloud = canonicalContent(cloudInput);
  const currentStreak = streakFromLaterSide(local.dailyStats, cloud.dailyStats);
  return {
    achievements: mergeAchievements(local.achievements, cloud.achievements),
    wordConnoisseur: unionSorted(local.wordConnoisseur, cloud.wordConnoisseur),
    statsNormal: maxStats(local.statsNormal, cloud.statsNormal),
    statsHard: maxStats(local.statsHard, cloud.statsHard),
    dailyStats: {
      currentStreak,
      bestStreak: Math.max(
        local.dailyStats.bestStreak,
        cloud.dailyStats.bestStreak,
        currentStreak
      ),
      totalPlayed: Math.max(
        local.dailyStats.totalPlayed,
        cloud.dailyStats.totalPlayed
      ),
      totalWon: Math.max(local.dailyStats.totalWon, cloud.dailyStats.totalWon),
      lastCompletedDate: latestDate(
        local.dailyStats.lastCompletedDate,
        cloud.dailyStats.lastCompletedDate
      ),
    },
    settings: mergeSettings(null, local.settings, cloud.settings),
    backgroundId: cloud.backgroundId ?? local.backgroundId,
  };
};

export const isPristine = (input: SyncContent): boolean => {
  const content = canonicalContent(input);
  return (
    content.statsNormal.totalGames === 0 &&
    content.statsHard.totalGames === 0 &&
    content.dailyStats.totalPlayed === 0 &&
    content.achievements.unlockedIds.length === 0 &&
    content.wordConnoisseur.length === 0
  );
};

const isSubset = (small: string[], large: string[]): boolean => {
  const set = new Set(large);
  return small.every((value) => set.has(value));
};

const statsAtLeast = (a: GameStats, b: GameStats): boolean => {
  const length = Math.max(a.winDistribution.length, b.winDistribution.length);
  for (let index = 0; index < length; index += 1) {
    if (
      elementAt(a.winDistribution, index) < elementAt(b.winDistribution, index)
    )
      return false;
  }
  return a.totalGames >= b.totalGames && a.gamesFailed >= b.gamesFailed;
};

export const dominates = (
  aInput: SyncContent,
  bInput: SyncContent
): boolean => {
  const a = canonicalContent(aInput);
  const b = canonicalContent(bInput);
  const flags: (keyof AchievementProgress)[] = [
    "wonInHardMode5Plus",
    "wonIn5GuessesEver",
    "wonWith7LettersEver",
    "wonOnFinalGuessEver",
    "wonWithoutReusingLettersEver",
    "wonWithMostlyGraysEver",
  ];
  return (
    statsAtLeast(a.statsNormal, b.statsNormal) &&
    statsAtLeast(a.statsHard, b.statsHard) &&
    a.dailyStats.totalPlayed >= b.dailyStats.totalPlayed &&
    a.dailyStats.totalWon >= b.dailyStats.totalWon &&
    isSubset(b.achievements.unlockedIds, a.achievements.unlockedIds) &&
    isSubset(b.wordConnoisseur, a.wordConnoisseur) &&
    flags.every((flag) => a.achievements[flag] || !b.achievements[flag])
  );
};

export const invariantHolds = (
  merged: SyncContent,
  local: SyncContent,
  cloud: SyncContent
): boolean => dominates(merged, local) && dominates(merged, cloud);

export const projectDeferred = (
  local: SyncContent,
  cloud: SyncContent,
  deferred: DeferredKeys
): SyncContent => {
  if (deferred.size === 0) return local;
  const settings: Record<string, unknown> = {
    ...(local.settings as Record<string, unknown>),
  };
  const cloudSettings = cloud.settings as Record<string, unknown>;
  deferred.forEach((key: DeferredKey) => {
    if (cloudSettings[key] !== undefined) settings[key] = cloudSettings[key];
  });
  return { ...local, settings };
};

export const snapshotWithLocalDeferred = (
  content: SyncContent,
  actualLocal: SyncContent,
  deferred: DeferredKeys
): SyncContent => {
  if (deferred.size === 0) return content;
  const settings: Record<string, unknown> = {
    ...(content.settings as Record<string, unknown>),
  };
  const actualSettings = actualLocal.settings as Record<string, unknown>;
  deferred.forEach((key: DeferredKey) => {
    if (actualSettings[key] === undefined) delete settings[key];
    else settings[key] = actualSettings[key];
  });
  return { ...content, settings };
};
