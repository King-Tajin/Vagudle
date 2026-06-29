const QUOTA_BYTES = 5 * 1024 * 1024;
const PRUNE_THRESHOLD = 0.95;
const PRUNE_TARGET = 0.9;

const allKeys = (): string[] => {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k !== null) keys.push(k);
  }
  return keys;
};

const byteSize = (key: string, value: string): number =>
  (key.length + value.length) * 2;

const estimateUsedBytes = (): number =>
  allKeys().reduce((total, key) => {
    const value = localStorage.getItem(key) ?? "";
    return total + byteSize(key, value);
  }, 0);

type TimestampedEntry = { key: string; savedAt: number; bytes: number };

const collectTimestampedEntries = (prefix: string): TimestampedEntry[] => {
  const entries: TimestampedEntry[] = [];
  for (const key of allKeys()) {
    if (!key.startsWith(prefix)) continue;
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.removeItem(key);
        continue;
      }
      const parsed = JSON.parse(stored) as { savedAt?: number };
      if (typeof parsed !== "object" || parsed === null) {
        localStorage.removeItem(key);
        continue;
      }
      entries.push({
        key,
        savedAt: parsed.savedAt ?? 0,
        bytes: byteSize(key, stored),
      });
    } catch {
      localStorage.removeItem(key);
    }
  }
  return entries;
};

const pruneToTarget = (usedBytes: number): void => {
  const targetBytes = QUOTA_BYTES * PRUNE_TARGET;

  const challenges = collectTimestampedEntries("chal_").sort(
    (a, b) => a.savedAt - b.savedAt
  );

  let remaining = usedBytes;
  for (const { key, bytes } of challenges) {
    if (remaining <= targetBytes) break;
    localStorage.removeItem(key);
    remaining -= bytes;
  }

  if (remaining <= targetBytes) return;

  const duels = collectTimestampedEntries("duel_").sort(
    (a, b) => a.savedAt - b.savedAt
  );

  for (const { key, bytes } of duels) {
    if (remaining <= targetBytes) break;
    localStorage.removeItem(key);
    remaining -= bytes;
  }
};

export const runStorageOptimization = (): void => {
  try {
    const used = estimateUsedBytes();
    if (used / QUOTA_BYTES >= PRUNE_THRESHOLD) {
      pruneToTarget(used);
    }
  } catch {}
};
