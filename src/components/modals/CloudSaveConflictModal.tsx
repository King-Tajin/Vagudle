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
import {
  getLocalMaxUpdatedAt,
  resolveCloudSaveConflict,
  type CloudSave,
  type CloudSaveConflictPick,
} from "../../lib/cloudSync";

type Props = {
  cloudSave: CloudSave;
  isMobile: boolean;
  onResolved: () => void;
};

const formatDate = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleString() : "Unknown";

const emptyStats: GameStats = {
  winDistribution: [],
  gamesFailed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  successRate: 0,
};

const parseStats = (value: string): GameStats => {
  try {
    return JSON.parse(value) as GameStats;
  } catch {
    return emptyStats;
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
}: {
  label: string;
  updatedAt: string | null;
  unlockedCount: number;
  statsNormal: GameStats;
  statsHard: GameStats;
}) => (
  <div className="p-3 space-y-2" style={sideColumnStyle}>
    <p className="font-pixel text-xs text-crown-amber tracking-widest">
      {label}
    </p>
    <p className="font-code text-xs text-gray-500">
      Updated {formatDate(updatedAt)}
    </p>
    <div className="font-code text-xs text-gray-300 space-y-1 pt-1">
      <p>{unlockedCount} achievements unlocked</p>
      <p>
        Normal: {statsNormal.totalGames - statsNormal.gamesFailed}/
        {statsNormal.totalGames} won
      </p>
      <p>
        Hard: {statsHard.totalGames - statsHard.gamesFailed}/
        {statsHard.totalGames} won
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
      setError("Couldn't sync your save. Please try again.");
      setResolving(false);
    }
  };

  return (
    <BaseModal
      title="Cloud Save Found"
      isOpen
      handleClose={() => {}}
      maxWidthClass="sm:max-w-md"
    >
      <p className="font-code text-xs text-gray-400 leading-snug mb-3">
        You have a save on this device and a save in the cloud. Pick which one
        to keep but achievements will merge either way, so you won&apos;t lose
        progress there.
      </p>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <SideSummary
          label="THIS DEVICE"
          updatedAt={getLocalMaxUpdatedAt()}
          unlockedCount={
            getEffectiveUnlockedIds(localAchievements.unlockedIds).length
          }
          statsNormal={localStatsNormal}
          statsHard={localStatsHard}
        />
        <SideSummary
          label="CLOUD SAVE"
          updatedAt={cloudSave.updatedAt}
          unlockedCount={getEffectiveUnlockedIds(cloudAchievementIds).length}
          statsNormal={parseStats(cloudSave.statsNormal)}
          statsHard={parseStats(cloudSave.statsHard)}
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
          KEEP THIS DEVICE
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
          KEEP CLOUD SAVE
        </button>
      </div>
    </BaseModal>
  );
};
