import { auth } from "./firebase";
import {
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage,
  loadStatsFromLocalStorage,
  saveStatsToLocalStorage,
  getUpdatedAt,
  cloudSyncKey,
  dispatchStorageSync,
  settingsKey,
  normalStatKey,
  hardStatKey,
  type GameStats,
  type StoredSettings,
} from "./localStorage";
import {
  loadAchievementProgress,
  saveAchievementProgress,
  loadWordConnoisseurList,
  saveWordConnoisseurList,
  ACHIEVEMENTS_KEY,
  WORD_CONNOISSEUR_KEY,
  type AchievementProgress,
} from "./achievements";
import {
  loadBackgroundId,
  saveBackgroundId,
  BG_KEY,
  type BackgroundId,
} from "./backgrounds";

export type CloudSavePayload = {
  achievements: string;
  wordConnoisseur: string;
  statsNormal: string;
  statsHard: string;
  settings: string;
  backgroundId: string | null;
};

export type CloudSave = CloudSavePayload & { updatedAt: string };

export type PullCloudSaveResult =
  | { status: "found"; save: CloudSave }
  | { status: "not_found" }
  | { status: "error" };

const FETCH_TIMEOUT_MS = 10000;

const emptyStats: GameStats = {
  winDistribution: [],
  gamesFailed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  successRate: 0,
};

export const getIdTokenForCurrentUser = async (): Promise<string | null> => {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
};

export const buildCloudSavePayloadFromLocalStorage = (
  isMobile: boolean
): CloudSavePayload => ({
  achievements: JSON.stringify(loadAchievementProgress()),
  wordConnoisseur: JSON.stringify(loadWordConnoisseurList()),
  statsNormal: JSON.stringify(loadStatsFromLocalStorage(false) ?? emptyStats),
  statsHard: JSON.stringify(loadStatsFromLocalStorage(true) ?? emptyStats),
  settings: JSON.stringify(loadSettingsFromLocalStorage()),
  backgroundId: loadBackgroundId(isMobile),
});

export const cloudSaveMatchesLocal = (
  cloudSave: CloudSave,
  isMobile: boolean
): boolean => {
  const local = buildCloudSavePayloadFromLocalStorage(isMobile);
  return (
    cloudSave.achievements === local.achievements &&
    cloudSave.wordConnoisseur === local.wordConnoisseur &&
    cloudSave.statsNormal === local.statsNormal &&
    cloudSave.statsHard === local.statsHard &&
    cloudSave.settings === local.settings &&
    (cloudSave.backgroundId ?? null) === (local.backgroundId ?? null)
  );
};

export const getLocalMaxUpdatedAt = (): string | null =>
  getUpdatedAt(cloudSyncKey);

const mergeAchievementProgress = (
  a: AchievementProgress,
  b: AchievementProgress
): AchievementProgress => ({
  unlockedIds: Array.from(new Set([...a.unlockedIds, ...b.unlockedIds])),
  wonInHardMode5Plus: a.wonInHardMode5Plus || b.wonInHardMode5Plus,
  wonIn5GuessesEver: a.wonIn5GuessesEver || b.wonIn5GuessesEver,
  wonWith7LettersEver: a.wonWith7LettersEver || b.wonWith7LettersEver,
  wonOnFinalGuessEver: a.wonOnFinalGuessEver || b.wonOnFinalGuessEver,
  wonWithoutReusingLettersEver:
    a.wonWithoutReusingLettersEver || b.wonWithoutReusingLettersEver,
});

const mergeWordConnoisseurLists = (a: string[], b: string[]): string[] =>
  Array.from(new Set([...a, ...b]));

export type CloudSaveConflictPick = "local" | "cloud";

export const resolveCloudSaveConflict = async (
  pick: CloudSaveConflictPick,
  cloudSave: CloudSave,
  isMobile: boolean
): Promise<string | null> => {
  const localAchievements = loadAchievementProgress();
  const localWordConnoisseur = loadWordConnoisseurList();

  let cloudAchievements = localAchievements;
  try {
    cloudAchievements = JSON.parse(
      cloudSave.achievements
    ) as AchievementProgress;
  } catch {}

  let cloudWordConnoisseur = localWordConnoisseur;
  try {
    cloudWordConnoisseur = JSON.parse(cloudSave.wordConnoisseur) as string[];
  } catch {}

  saveAchievementProgress(
    mergeAchievementProgress(localAchievements, cloudAchievements)
  );
  dispatchStorageSync(ACHIEVEMENTS_KEY);

  saveWordConnoisseurList(
    mergeWordConnoisseurLists(localWordConnoisseur, cloudWordConnoisseur)
  );
  dispatchStorageSync(WORD_CONNOISSEUR_KEY);

  if (pick === "cloud") {
    try {
      saveStatsToLocalStorage(
        JSON.parse(cloudSave.statsNormal) as GameStats,
        false
      );
      dispatchStorageSync(normalStatKey);
    } catch {}
    try {
      saveStatsToLocalStorage(
        JSON.parse(cloudSave.statsHard) as GameStats,
        true
      );
      dispatchStorageSync(hardStatKey);
    } catch {}
    try {
      saveSettingsToLocalStorage(
        JSON.parse(cloudSave.settings) as StoredSettings
      );
      dispatchStorageSync(settingsKey);
    } catch {}
    if (cloudSave.backgroundId) {
      saveBackgroundId(cloudSave.backgroundId as BackgroundId);
      dispatchStorageSync(BG_KEY);
    }
  }

  const idToken = await getIdTokenForCurrentUser();
  if (!idToken) return null;
  return pushCloudSave(
    idToken,
    buildCloudSavePayloadFromLocalStorage(isMobile)
  );
};

export const pushCloudSave = async (
  idToken: string,
  payload: CloudSavePayload
): Promise<string | null> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch("/api/save", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    const data = (await res.json()) as {
      success: boolean;
      updatedAt?: string;
    };
    return data.success && data.updatedAt ? data.updatedAt : null;
  } catch {
    return null;
  }
};

export const pullCloudSave = async (
  idToken: string
): Promise<PullCloudSaveResult> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const res = await fetch("/api/load", {
      headers: { Authorization: `Bearer ${idToken}` },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.status === 404) return { status: "not_found" };
    const data = (await res.json()) as {
      success: boolean;
      save?: CloudSave;
    };
    if (data.success && data.save) return { status: "found", save: data.save };
    return { status: "error" };
  } catch {
    return { status: "error" };
  }
};

const RELATIVE_TIME_UNITS: {
  limitSeconds: number;
  divisorSeconds: number;
  label: string;
}[] = [
  { limitSeconds: 60, divisorSeconds: 1, label: "second" },
  { limitSeconds: 3600, divisorSeconds: 60, label: "minute" },
  { limitSeconds: 86400, divisorSeconds: 3600, label: "hour" },
  { limitSeconds: 2592000, divisorSeconds: 86400, label: "day" },
  { limitSeconds: 31536000, divisorSeconds: 2592000, label: "month" },
  { limitSeconds: Infinity, divisorSeconds: 31536000, label: "year" },
];

export const formatRelativeTime = (iso: string): string => {
  const diffSeconds = Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  );
  if (diffSeconds < 10) return "just now";
  const unit =
    RELATIVE_TIME_UNITS.find((u) => diffSeconds < u.limitSeconds) ??
    RELATIVE_TIME_UNITS[RELATIVE_TIME_UNITS.length - 1];
  const value = Math.floor(diffSeconds / unit.divisorSeconds);
  return `${value} ${unit.label}${value === 1 ? "" : "s"} ago`;
};
