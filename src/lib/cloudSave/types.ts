import type { GameStats, StoredSettings } from "../localStorage";
import type { DailyStats } from "../daily";
import type { AchievementProgress } from "../achievements";

export type SyncedSettings = Partial<Omit<StoredSettings, "language">>;

export type SyncContent = {
  achievements: AchievementProgress;
  wordConnoisseur: string[];
  statsNormal: GameStats;
  statsHard: GameStats;
  dailyStats: DailyStats;
  settings: SyncedSettings;
  backgroundId: string | null;
};

export type RawSyncContent = {
  achievements?: Partial<AchievementProgress> | null;
  wordConnoisseur?: unknown[] | null;
  statsNormal?: Partial<GameStats> | null;
  statsHard?: Partial<GameStats> | null;
  dailyStats?: Partial<DailyStats> | null;
  settings?: Record<string, unknown> | null;
  backgroundId?: string | null;
};

export type ActivityStamps = {
  lastPlayedAt: string | null;
  firstSeenAt: string | null;
};

export type DeferredKey = keyof SyncedSettings;

export type DeferredKeys = ReadonlySet<DeferredKey>;

export type SyncIdentity = {
  uid: string;
  label: string;
};

export type LocalSnapshot = {
  content: SyncContent;
  activity: ActivityStamps;
  language: string;
};
