import { canonicalContent, canonicalSettings } from "./canonical";
import type { ActivityStamps, SyncContent } from "./types";

export type CloudSavePayload = {
  achievements: string;
  wordConnoisseur: string;
  statsNormal: string;
  statsHard: string;
  dailyStats: string;
  settings: string;
  backgroundId: string | null;
  lastPlayedAt: string | null;
  firstSeenAt: string | null;
};

export type CloudSaveRow = CloudSavePayload & {
  updatedAt: string;
  rev: number;
};

const safeParse = (text: string): unknown => {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
};

const asRecord = (value: unknown): Record<string, unknown> | null =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

export const parseCloudSave = (
  row: CloudSaveRow
): { content: SyncContent; activity: ActivityStamps } => {
  const achievements = asRecord(safeParse(row.achievements));
  const wordConnoisseur = safeParse(row.wordConnoisseur);
  const settings = asRecord(safeParse(row.settings));
  return {
    content: canonicalContent({
      achievements,
      wordConnoisseur: Array.isArray(wordConnoisseur) ? wordConnoisseur : [],
      statsNormal: asRecord(safeParse(row.statsNormal)),
      statsHard: asRecord(safeParse(row.statsHard)),
      dailyStats: asRecord(safeParse(row.dailyStats)),
      settings: canonicalSettings(settings),
      backgroundId: row.backgroundId,
    }),
    activity: {
      lastPlayedAt: row.lastPlayedAt ?? null,
      firstSeenAt: row.firstSeenAt ?? null,
    },
  };
};

export const buildPayload = (
  content: SyncContent,
  activity: ActivityStamps,
  language: string
): CloudSavePayload => ({
  achievements: JSON.stringify(content.achievements),
  wordConnoisseur: JSON.stringify(content.wordConnoisseur),
  statsNormal: JSON.stringify(content.statsNormal),
  statsHard: JSON.stringify(content.statsHard),
  dailyStats: JSON.stringify(content.dailyStats),
  settings: JSON.stringify({ ...content.settings, language }),
  backgroundId: content.backgroundId,
  lastPlayedAt: activity.lastPlayedAt,
  firstSeenAt: activity.firstSeenAt,
});
