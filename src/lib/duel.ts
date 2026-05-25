import type { ChallengeDict } from "./challenge";

export type { ChallengeDict };

export type DuelConfig = {
  word: string;
  dict: ChallengeDict;
  guesses: 9 | 11;
  id: string;
  length: number;
  discord_id: string;
  created_at: number;
};

export type DuelGameState = {
  guesses: string[];
  cellColors: { [key: string]: string };
  autoGrayLetters: string[];
  savedAt?: number;
};

export type DuelSaveStatus = "idle" | "saving" | "saved" | "failed";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MAX_DUEL_ENTRIES = 500;

export const pruneOldDuelStates = (): void => {
  const now = Date.now();
  const surviving: { key: string; savedAt: number }[] = [];
  const allKeys: string[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith("duel_")) allKeys.push(key);
  }

  for (const key of allKeys) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) {
        localStorage.removeItem(key);
        continue;
      }
      const parsed = JSON.parse(stored) as DuelGameState;
      if (!parsed.savedAt || now - parsed.savedAt > ONE_DAY_MS) {
        localStorage.removeItem(key);
      } else {
        surviving.push({ key, savedAt: parsed.savedAt });
      }
    } catch {
      localStorage.removeItem(key);
    }
  }

  if (surviving.length > MAX_DUEL_ENTRIES) {
    surviving
      .sort((a, b) => a.savedAt - b.savedAt)
      .slice(0, surviving.length - MAX_DUEL_ENTRIES)
      .forEach(({ key }) => localStorage.removeItem(key));
  }
};

export const decodeDuel = async (
  token: string
): Promise<
  | { config: DuelConfig; expired: false }
  | { config: null; expired: true }
  | null
> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(`/api/duel?token=${encodeURIComponent(token)}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (!data.success) return null;
    if (data.expired) return { config: null, expired: true };
    return { config: data.config as DuelConfig, expired: false };
  } catch {
    return null;
  }
};

const duelStateKey = (id: string, discord_id: string) =>
  `duel_${id}_${discord_id}`;

export const saveDuelState = (
  id: string,
  discord_id: string,
  state: DuelGameState
): void => {
  try {
    localStorage.setItem(
      duelStateKey(id, discord_id),
      JSON.stringify({ ...state, savedAt: Date.now() })
    );
  } catch {}
};

export const loadDuelState = (
  id: string,
  discord_id: string
): DuelGameState | null => {
  try {
    const stored = localStorage.getItem(duelStateKey(id, discord_id));
    if (!stored) return null;
    const parsed = JSON.parse(stored) as DuelGameState;
    if (!parsed.savedAt || Date.now() - parsed.savedAt > ONE_DAY_MS) {
      localStorage.removeItem(duelStateKey(id, discord_id));
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(duelStateKey(id, discord_id));
    return null;
  }
};

export const submitDuelResult = async (
  token: string,
  won: boolean,
  guessesUsed: number
): Promise<boolean> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch("/api/duel-result", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, won, guessesUsed }),
      signal: controller.signal,
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
};
