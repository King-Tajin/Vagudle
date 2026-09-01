import strings from "../../../constants/strings";

const RankBadge = ({ rank }: { rank: number }) => {
  const medal =
    rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
  return (
    <span
      className="font-pixel text-xs w-6 text-center shrink-0"
      style={{ color: medal ? undefined : "#6b7280" }}
    >
      {medal ?? rank}
    </span>
  );
};

export const LeaderboardRow = ({
  rank,
  username,
  wins,
  losses,
  currentStreak,
  bestStreak,
  highlight,
}: {
  rank: number;
  username: string;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  highlight?: boolean;
}) => (
  <div
    className="flex items-center gap-3 px-3 py-2.5"
    style={{
      background: highlight ? "rgba(80,0,170,0.18)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${
        highlight ? "rgba(80,0,170,0.5)" : "rgba(255,255,255,0.06)"
      }`,
    }}
  >
    <RankBadge rank={rank} />
    <span className="font-code text-sm text-gray-200 flex-1 min-w-0 truncate">
      {username}
    </span>
    <div className="flex items-center gap-3 shrink-0">
      <div className="text-center">
        <p className="font-pixel text-[8px] text-gray-500 tracking-widest">
          {strings.LEADERBOARD_ROW_WINS_LOSSES_LABEL}
        </p>
        <p className="font-code text-base font-semibold text-gray-300">
          {wins}/{losses}
        </p>
      </div>
      <div className="text-center">
        <p className="font-pixel text-[8px] text-gray-500 tracking-widest">
          {strings.LEADERBOARD_ROW_STREAK_LABEL}
        </p>
        <p className="font-code text-base font-semibold text-gray-300">
          {currentStreak}
        </p>
      </div>
      <div className="text-center">
        <p className="font-pixel text-[8px] text-crown-amber tracking-widest">
          {strings.LEADERBOARD_ROW_BEST_LABEL}
        </p>
        <p className="font-code text-base font-semibold text-crown-amber">
          {bestStreak}
        </p>
      </div>
    </div>
  </div>
);
