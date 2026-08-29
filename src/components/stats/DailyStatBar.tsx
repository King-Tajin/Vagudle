import { type DailyStats } from "../../lib/daily";
import {
  DAYS_PLAYED_TEXT,
  SUCCESS_RATE_TEXT,
  CURRENT_STREAK_TEXT,
  BEST_STREAK_TEXT,
  LAST_COMPLETED_TEXT,
} from "../../constants/strings";

type Props = {
  dailyStats: DailyStats;
};

const StatItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => {
  return (
    <div className="items-center justify-center m-1 w-1/4 dark:text-white">
      <div className="text-3xl font-bold">{value}</div>
      <div className="text-xs">{label}</div>
    </div>
  );
};

export const DailyStatBar = ({ dailyStats }: Props) => {
  const winRate =
    dailyStats.totalPlayed > 0
      ? Math.round((dailyStats.totalWon / dailyStats.totalPlayed) * 100)
      : 0;

  return (
    <>
      <div className="flex justify-center my-2">
        <StatItem label={DAYS_PLAYED_TEXT} value={dailyStats.totalPlayed} />
        <StatItem label={SUCCESS_RATE_TEXT} value={`${winRate}%`} />
        <StatItem
          label={CURRENT_STREAK_TEXT}
          value={dailyStats.currentStreak}
        />
        <StatItem label={BEST_STREAK_TEXT} value={dailyStats.bestStreak} />
      </div>
      {dailyStats.lastCompletedDate && (
        <p className="font-code text-xs text-gray-500 text-center mt-2">
          {LAST_COMPLETED_TEXT}: {dailyStats.lastCompletedDate}
        </p>
      )}
    </>
  );
};
