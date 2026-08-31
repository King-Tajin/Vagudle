import { type GameStats } from "../../lib/localStorage";
import strings from "../../constants/strings";

type Props = {
  gameStats: GameStats;
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

export const StatBar = ({ gameStats }: Props) => {
  return (
    <div className="flex justify-center my-2">
      <StatItem label={strings.TOTAL_TRIES_TEXT} value={gameStats.totalGames} />
      <StatItem
        label={strings.SUCCESS_RATE_TEXT}
        value={`${gameStats.successRate}%`}
      />
      <StatItem
        label={strings.CURRENT_STREAK_TEXT}
        value={gameStats.currentStreak}
      />
      <StatItem label={strings.BEST_STREAK_TEXT} value={gameStats.bestStreak} />
    </div>
  );
};
