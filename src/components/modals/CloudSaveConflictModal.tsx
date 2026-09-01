import { useState } from "react";
import { BaseModal } from "./BaseModal";
import {
  loadAchievementProgress,
  getEffectiveUnlockedIds,
} from "../../lib/achievements";
import {
  loadStatsFromLocalStorage,
  type GameStats,
} from "../../lib/localStorage";
import { loadDailyStats, type DailyStats } from "../../lib/daily";
import {
  getLocalMaxUpdatedAt,
  resolveCloudSaveConflict,
  type CloudSave,
  type CloudSaveConflictPick,
} from "../../lib/cloudSync";
import strings from "../../constants/strings";

type Props = {
  cloudSave: CloudSave;
  isMobile: boolean;
  onResolved: () => void;
};

const formatDate = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleString()
    : strings.CLOUD_SAVE_CONFLICT_DATE_FALLBACK_TEXT;

const emptyStats: GameStats = {
  winDistribution: [],
  gamesFailed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  successRate: 0,
};

const emptyDailyStats: DailyStats = {
  currentStreak: 0,
  bestStreak: 0,
  totalPlayed: 0,
  totalWon: 0,
  lastCompletedDate: null,
};

const parseStats = (value: string): GameStats => {
  try {
    return JSON.parse(value) as GameStats;
  } catch {
    return emptyStats;
  }
};

const parseDailyStats = (value: string): DailyStats => {
  try {
    return {
      ...emptyDailyStats,
      ...(JSON.parse(value) as Partial<DailyStats>),
    };
  } catch {
    return emptyDailyStats;
  }
};

const sideColumnStyle = {
  background: "rgba(255,255,255,0.03)",
  border: "2px solid #3a3a4a",
};

const SideSummary = ({
  label,
  updatedAt,
  unlockedCount,
  statsNormal,
  statsHard,
  dailyStats,
}: {
  label: string;
  updatedAt: string | null;
  unlockedCount: number;
  statsNormal: GameStats;
  statsHard: GameStats;
  dailyStats: DailyStats;
}) => (
  <div className="p-3 space-y-2" style={sideColumnStyle}>
    <p className="font-pixel text-xs text-crown-amber tracking-widest">
      {label}
    </p>
    <p className="font-code text-xs text-gray-500">
      {strings.CLOUD_SAVE_CONFLICT_UPDATED_TEXT(formatDate(updatedAt))}
    </p>
    <div className="font-code text-xs text-gray-300 space-y-1 pt-1">
      <p>
        {strings.CLOUD_SAVE_CONFLICT_ACHIEVEMENTS_UNLOCKED_TEXT(unlockedCount)}
      </p>
      <p>
        {strings.CLOUD_SAVE_CONFLICT_NORMAL_WON_TEXT(
          statsNormal.totalGames - statsNormal.gamesFailed,
          statsNormal.totalGames
        )}
      </p>
      <p>
        {strings.CLOUD_SAVE_CONFLICT_HARD_WON_TEXT(
          statsHard.totalGames - statsHard.gamesFailed,
          statsHard.totalGames
        )}
      </p>
      <p>
        {strings.CLOUD_SAVE_CONFLICT_DAILY_WON_TEXT(
          dailyStats.totalWon,
          dailyStats.totalPlayed,
          dailyStats.currentStreak
        )}
      </p>
    </div>
  </div>
);

export const CloudSaveConflictModal = ({
  cloudSave,
  isMobile,
  onResolved,
}: Props) => {
  const [resolving, setResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localAchievements = loadAchievementProgress();
  const localStatsNormal = loadStatsFromLocalStorage(false) ?? emptyStats;
  const localStatsHard = loadStatsFromLocalStorage(true) ?? emptyStats;
  const localDailyStats = loadDailyStats();

  const cloudAchievementIds: string[] = (() => {
    try {
      return (JSON.parse(cloudSave.achievements) as { unlockedIds: string[] })
        .unlockedIds;
    } catch {
      return [];
    }
  })();

  const handlePick = async (pick: CloudSaveConflictPick) => {
    setResolving(true);
    setError(null);
    const updatedAt = await resolveCloudSaveConflict(pick, cloudSave, isMobile);
    if (updatedAt) {
      onResolved();
    } else {
      setError(strings.CLOUD_SAVE_CONFLICT_SYNC_ERROR_TEXT);
      setResolving(false);
    }
  };

  return (
    <BaseModal
      title={strings.MODAL_TITLE_CLOUD_SAVE_FOUND}
      isOpen
      handleClose={() => {}}
      maxWidthClass="sm:max-w-md"
    >
      <p className="font-code text-xs text-gray-400 leading-snug mb-3">
        {strings.CLOUD_SAVE_CONFLICT_INTRO_TEXT}
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <SideSummary
          label={strings.CLOUD_SAVE_CONFLICT_THIS_DEVICE_LABEL}
          updatedAt={getLocalMaxUpdatedAt()}
          unlockedCount={
            getEffectiveUnlockedIds(localAchievements.unlockedIds).length
          }
          statsNormal={localStatsNormal}
          statsHard={localStatsHard}
          dailyStats={localDailyStats}
        />
        <SideSummary
          label={strings.CLOUD_SAVE_CONFLICT_CLOUD_SAVE_LABEL}
          updatedAt={cloudSave.updatedAt}
          unlockedCount={getEffectiveUnlockedIds(cloudAchievementIds).length}
          statsNormal={parseStats(cloudSave.statsNormal)}
          statsHard={parseStats(cloudSave.statsHard)}
          dailyStats={parseDailyStats(cloudSave.dailyStats)}
        />
      </div>
      {error && (
        <p className="font-code text-xs text-spice-red mb-3">{error}</p>
      )}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={resolving}
          onClick={() => void handlePick("local")}
          className="font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-50"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "2px solid #3a3a4a",
            color: "#d1d5db",
          }}
        >
          {strings.CLOUD_SAVE_CONFLICT_KEEP_DEVICE_BUTTON_TEXT}
        </button>
        <button
          type="button"
          disabled={resolving}
          onClick={() => void handlePick("cloud")}
          className="font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-50"
          style={{
            background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
            border: "2px solid #5000aa",
            color: "#fff",
          }}
        >
          {strings.CLOUD_SAVE_CONFLICT_KEEP_CLOUD_BUTTON_TEXT}
        </button>
      </div>
    </BaseModal>
  );
};
