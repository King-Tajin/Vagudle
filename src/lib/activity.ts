import { stampUpdatedAt, cloudSyncKey } from "./localStorage";

export const LAST_PLAYED_AT_KEY = "vagudle-last-played-at";
export const FIRST_SEEN_AT_KEY = "vagudle-first-seen-at";

const parseStoredDate = (value: string | null): Date | null => {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const recordLastPlayedAt = (now: Date = new Date()): void => {
  try {
    localStorage.setItem(LAST_PLAYED_AT_KEY, now.toISOString());
    stampUpdatedAt(cloudSyncKey);
  } catch {}
};

export const getLastPlayedAt = (): Date | null => {
  try {
    return parseStoredDate(localStorage.getItem(LAST_PLAYED_AT_KEY));
  } catch {
    return null;
  }
};

export const getOrInitFirstSeenAt = (now: Date = new Date()): Date => {
  try {
    const existing = parseStoredDate(localStorage.getItem(FIRST_SEEN_AT_KEY));
    if (existing) return existing;
    localStorage.setItem(FIRST_SEEN_AT_KEY, now.toISOString());
    stampUpdatedAt(cloudSyncKey);
    return now;
  } catch {
    return now;
  }
};

export const setFirstSeenAt = (date: Date): void => {
  try {
    localStorage.setItem(FIRST_SEEN_AT_KEY, date.toISOString());
    stampUpdatedAt(cloudSyncKey);
  } catch {}
};

export const getInactivityBaselineDate = (
  lastPlayedAt: Date | null,
  lastDailyCompletedDate: string | null,
  firstSeenAt: Date
): Date => {
  const candidates: Date[] = [];

  if (lastPlayedAt) candidates.push(lastPlayedAt);

  if (lastDailyCompletedDate) {
    const parsedDaily = new Date(`${lastDailyCompletedDate}T00:00:00Z`);
    if (!Number.isNaN(parsedDaily.getTime())) candidates.push(parsedDaily);
  }

  if (candidates.length === 0) return firstSeenAt;

  return candidates.reduce((latest, candidate) =>
    candidate.getTime() > latest.getTime() ? candidate : latest
  );
};
