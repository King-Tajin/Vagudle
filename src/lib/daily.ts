export type DailyConfig = {
  date: string;
  word: string;
  wordLength: number;
  hardMode: boolean;
  originDate: string;
};

export type DailyResult = {
  date: string;
  won: boolean;
  guessCount: number;
  maxGuesses: number;
  wordLength: number;
  completedAt: number;
};

export type DailyProgress = {
  guesses: string[];
  cellColors: { [key: string]: string };
  savedAt?: number;
};

export type DailyStats = {
  currentStreak: number;
  bestStreak: number;
  totalPlayed: number;
  totalWon: number;
  lastCompletedDate: string | null;
};

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export const DAILY_PATH = "/daily";

export const msUntilNextUtcMidnight = (date: Date = new Date()): number => {
  const next = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate() + 1
  );
  return next - date.getTime();
};

export const getDailyNumber = (date: string, originDate: string): number => {
  const start = new Date(`${originDate}T00:00:00Z`).getTime();
  const current = new Date(`${date}T00:00:00Z`).getTime();
  return Math.max(1, Math.round((current - start) / ONE_DAY_MS) + 1);
};

export const fetchDailyConfig = async (): Promise<DailyConfig | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch("/api/daily", { signal: controller.signal });
    if (!res.ok) return null;
    const data = (await res.json()) as
      | {
          success: true;
          date: string;
          word: string;
          wordLength: number;
          hardMode: boolean;
          originDate: string;
        }
      | { success: false; error: string };
    if (!data.success) return null;
    return {
      date: data.date,
      word: data.word,
      wordLength: data.wordLength,
      hardMode: data.hardMode,
      originDate: data.originDate,
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

const progressKey = (date: string) => `daily_progress_${date}`;

export const saveDailyProgress = (
  date: string,
  progress: Omit<DailyProgress, "savedAt">
): void => {
  try {
    localStorage.setItem(
      progressKey(date),
      JSON.stringify({ ...progress, savedAt: Date.now() })
    );
  } catch {}
};

export const loadDailyProgress = (date: string): DailyProgress | null => {
  try {
    const stored = localStorage.getItem(progressKey(date));
    return stored ? (JSON.parse(stored) as DailyProgress) : null;
  } catch {
    return null;
  }
};

export const clearDailyProgress = (date: string): void => {
  try {
    localStorage.removeItem(progressKey(date));
  } catch {}
};

const resultKey = (date: string) => `daily_result_${date}`;

export const saveDailyResult = (result: DailyResult): void => {
  try {
    localStorage.setItem(resultKey(result.date), JSON.stringify(result));
  } catch {}
};

export const loadDailyResult = (date: string): DailyResult | null => {
  try {
    const stored = localStorage.getItem(resultKey(date));
    return stored ? (JSON.parse(stored) as DailyResult) : null;
  } catch {
    return null;
  }
};

const ONE_YEAR_MS = 365 * ONE_DAY_MS;

export const pruneOldDailyEntries = (): void => {
  const now = Date.now();
  const keysToRemove: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (!key.startsWith("daily_progress_") && !key.startsWith("daily_result_"))
      continue;

    const dateString = key.slice(key.indexOf("_", 6) + 1);
    const parsed = new Date(`${dateString}T00:00:00Z`).getTime();
    if (Number.isNaN(parsed) || now - parsed > ONE_YEAR_MS) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
};

export const dailyStatsKey = "dailyStats:v1";

const defaultDailyStats: DailyStats = {
  currentStreak: 0,
  bestStreak: 0,
  totalPlayed: 0,
  totalWon: 0,
  lastCompletedDate: null,
};

export const loadDailyStats = (): DailyStats => {
  try {
    const stored = localStorage.getItem(dailyStatsKey);
    return stored
      ? { ...defaultDailyStats, ...(JSON.parse(stored) as Partial<DailyStats>) }
      : defaultDailyStats;
  } catch {
    return defaultDailyStats;
  }
};

const saveDailyStats = (stats: DailyStats): void => {
  try {
    localStorage.setItem(dailyStatsKey, JSON.stringify(stats));
  } catch {}
};

const isDayAfter = (previousDate: string, date: string): boolean => {
  const previous = new Date(`${previousDate}T00:00:00Z`).getTime();
  const current = new Date(`${date}T00:00:00Z`).getTime();
  return current - previous === ONE_DAY_MS;
};

export type DailyLeaderboardEntry = {
  username: string;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
};

export type DailyLeaderboardSelf = DailyLeaderboardEntry & { rank: number };

export type DailyLeaderboardResponse = {
  top: DailyLeaderboardEntry[];
  self: DailyLeaderboardSelf | null;
};

export type SubmitDailyResultOutcome =
  "recorded" | "already_submitted" | "no_display_name" | "error";

export const submitDailyResult = async (
  idToken: string,
  won: boolean
): Promise<SubmitDailyResultOutcome> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch("/api/daily-result", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({ won }),
      signal: controller.signal,
    });
    if (res.status === 409) return "already_submitted";
    if (res.status === 422) return "no_display_name";
    const data = (await res.json()) as { success: boolean };
    return data.success ? "recorded" : "error";
  } catch {
    return "error";
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchDailyLeaderboard = async (
  idToken: string | null
): Promise<DailyLeaderboardResponse | null> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch("/api/daily-leaderboard", {
      headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data = (await res.json()) as
      | {
          success: true;
          top: DailyLeaderboardEntry[];
          self: DailyLeaderboardSelf | null;
        }
      | { success: false; error: string };
    if (!data.success) return null;
    return { top: data.top, self: data.self };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
};

export const recordDailyStats = (date: string, won: boolean): DailyStats => {
  const stats = loadDailyStats();
  if (stats.lastCompletedDate === date) return stats;

  const updated: DailyStats = { ...stats, totalPlayed: stats.totalPlayed + 1 };

  if (won) {
    updated.totalWon = stats.totalWon + 1;
    updated.currentStreak =
      stats.lastCompletedDate && isDayAfter(stats.lastCompletedDate, date)
        ? stats.currentStreak + 1
        : 1;
    updated.bestStreak = Math.max(stats.bestStreak, updated.currentStreak);
  } else {
    updated.currentStreak = 0;
  }
  updated.lastCompletedDate = date;

  saveDailyStats(updated);
  return updated;
};
