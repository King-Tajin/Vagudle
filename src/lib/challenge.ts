export type ChallengeDict = "normal" | "hard" | "full";

export type ChallengeConfig = {
  word: string;
  dict: ChallengeDict;
  guesses: 9 | 11;
  id: string;
  length: number;
};

export type ChallengeGameState = {
  guesses: string[];
  cellColors: { [key: string]: string };
  autoGrayLetters: string[];
};

export const encodeChallenge = async (
  config: Omit<ChallengeConfig, "id">
): Promise<{ encoded: string; id: string } | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch("/api/challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = await res.json();
    if (!data.success) return null;
    return { encoded: data.encoded, id: data.id };
  } catch {
    return null;
  }
};

export const decodeChallenge = async (
  token: string
): Promise<ChallengeConfig | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const res = await fetch(
      `/api/challenge?token=${encodeURIComponent(token)}`,
      {
        signal: controller.signal,
      }
    );
    clearTimeout(timeout);
    const data = await res.json();
    if (!data.success) return null;
    return data.config as ChallengeConfig;
  } catch {
    return null;
  }
};

export const buildChallengeUrl = (encoded: string): string =>
  `${window.location.origin}${window.location.pathname}?challenge=${encoded}`;

const challengeStateKey = (id: string) => `chal_${id}`;

export const saveChallengeState = (
  id: string,
  state: ChallengeGameState
): void => {
  try {
    localStorage.setItem(challengeStateKey(id), JSON.stringify(state));
  } catch {}
};

export const loadChallengeState = (id: string): ChallengeGameState | null => {
  try {
    const stored = localStorage.getItem(challengeStateKey(id));
    return stored ? (JSON.parse(stored) as ChallengeGameState) : null;
  } catch {
    localStorage.removeItem(challengeStateKey(id));
    return null;
  }
};

export const DICT_LABELS: Record<ChallengeDict, string> = {
  normal: "Normal",
  hard: "Hard",
  full: "Extreme",
};

export const DICT_DESCRIPTIONS: Record<ChallengeDict, string> = {
  normal: "Common English words",
  hard: "Uncommon English words",
  full: "Full Scrabble dictionary",
};
