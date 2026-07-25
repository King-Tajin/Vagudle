import { useEffect, useState } from "react";
import { Loader, Trophy, Pencil } from "lucide-react";
import { BaseModal } from "./BaseModal";
import {
  fetchDailyLeaderboard,
  type DailyLeaderboardResponse,
} from "../../lib/daily";
import {
  fetchUsernameStatus,
  updateUsername,
  USERNAME_PATTERN,
  type UsernameStatus,
} from "../../lib/username";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  idToken: string | null;
};

const formatCooldown = (canChangeAt: string): string => {
  const ms = new Date(canChangeAt).getTime() - Date.now();
  const days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  return `${days} day${days === 1 ? "" : "s"}`;
};

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

const LeaderboardRow = ({
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
          W/L
        </p>
        <p className="font-code text-xs text-gray-300">
          {wins}/{losses}
        </p>
      </div>
      <div className="text-center">
        <p className="font-pixel text-[8px] text-gray-500 tracking-widest">
          STREAK
        </p>
        <p className="font-code text-xs text-gray-300">{currentStreak}</p>
      </div>
      <div className="text-center">
        <p className="font-pixel text-[8px] text-crown-amber tracking-widest">
          BEST
        </p>
        <p className="font-code text-xs text-crown-amber">{bestStreak}</p>
      </div>
    </div>
  </div>
);

export const LeaderboardModal = ({ isOpen, handleClose, idToken }: Props) => {
  const [status, setStatus] = useState<"loading" | "error" | "loaded">(
    "loading"
  );
  const [data, setData] = useState<DailyLeaderboardResponse | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus | null>(
    null
  );
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!idToken) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    setStatus("loading");
    setSubmitError(null);
    void Promise.all([
      fetchDailyLeaderboard(idToken),
      fetchUsernameStatus(idToken),
    ]).then(([leaderboard, username]) => {
      if (cancelled) return;
      if (!leaderboard) {
        setStatus("error");
        return;
      }
      setData(leaderboard);
      setUsernameStatus(username);
      setIsEditing(!username?.username);
      setInputValue(username?.username ?? "");
      setStatus("loaded");
    });
    return () => {
      cancelled = true;
    };
  }, [isOpen, idToken]);

  const handleSubmitUsername = async () => {
    if (!idToken || isSubmitting) return;
    const trimmed = inputValue.trim().replace(/\s+/g, " ");
    if (!USERNAME_PATTERN.test(trimmed)) {
      setSubmitError("3-20 characters: letters, numbers, spaces, - or _");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    const outcome = await updateUsername(idToken, trimmed);
    setIsSubmitting(false);

    if (outcome.status === "updated") {
      setUsernameStatus({
        username: outcome.username,
        canChangeAt: outcome.canChangeAt,
      });
      setInputValue(outcome.username);
      setIsEditing(false);
      const refreshed = await fetchDailyLeaderboard(idToken);
      if (refreshed) setData(refreshed);
      return;
    }

    if (outcome.status === "invalid")
      setSubmitError("3-20 characters: letters, numbers, spaces, - or _");
    else if (outcome.status === "taken")
      setSubmitError("That username is already taken.");
    else if (outcome.status === "rate_limited")
      setSubmitError(
        `You can change your name again in ${formatCooldown(outcome.retryAt)}.`
      );
    else setSubmitError("Something went wrong. Please try again.");
  };

  return (
    <BaseModal
      title="Daily Leaderboard"
      isOpen={isOpen}
      handleClose={handleClose}
      maxWidthClass="sm:max-w-md"
      headerExtra={<Trophy className="w-6 h-6 text-crown-gold shrink-0" />}
    >
      {status === "loading" && (
        <div className="flex items-center gap-3 py-8 justify-center">
          <Loader className="w-4 h-4 text-gray-400 animate-spin" />
          <p className="font-code text-sm text-gray-400">
            Loading leaderboard...
          </p>
        </div>
      )}

      {status === "error" && (
        <p className="font-code text-sm text-gray-300 text-center py-6">
          Couldn't load the leaderboard. Please try again later.
        </p>
      )}

      {status === "loaded" && data && (
        <div className="space-y-2">
          {usernameStatus && (
            <div
              className="mb-2 p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {isEditing ? (
                <>
                  <p className="font-pixel text-[9px] text-gray-500 tracking-widest mb-2">
                    {usernameStatus.username
                      ? "CHANGE USERNAME"
                      : "SET A USERNAME TO JOIN THE LEADERBOARD"}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      maxLength={20}
                      placeholder="Your leaderboard name"
                      className="flex-1 min-w-0 px-2.5 py-1.5 font-code text-sm bg-obsidian-800 text-white border border-obsidian-600 focus:outline-none focus:border-crown-amber"
                    />
                    <button
                      type="button"
                      onClick={() => void handleSubmitUsername()}
                      disabled={isSubmitting}
                      className="px-3 py-1.5 font-pixel text-[10px] tracking-wider bg-obsidian-700 hover:bg-obsidian-600 disabled:opacity-50 text-crown-amber transition-colors pixel-border-sm"
                    >
                      {isSubmitting ? "..." : "SAVE"}
                    </button>
                    {usernameStatus.username && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setInputValue(usernameStatus.username ?? "");
                          setSubmitError(null);
                        }}
                        className="px-3 py-1.5 font-pixel text-[10px] tracking-wider text-gray-400 hover:text-gray-200 transition-colors"
                      >
                        CANCEL
                      </button>
                    )}
                  </div>
                  {submitError && (
                    <p className="mt-2 font-code text-xs text-red-400">
                      {submitError}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <p className="font-code text-sm text-gray-200 truncate">
                    Playing as{" "}
                    <span className="text-crown-amber">
                      {usernameStatus.username}
                    </span>
                  </p>
                  {usernameStatus.canChangeAt ? (
                    <p className="font-pixel text-[9px] text-gray-500 tracking-widest shrink-0">
                      NEXT CHANGE IN{" "}
                      {formatCooldown(usernameStatus.canChangeAt).toUpperCase()}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-1 font-pixel text-[9px] text-gray-400 hover:text-crown-amber tracking-widest transition-colors shrink-0"
                    >
                      <Pencil className="w-3 h-3" />
                      CHANGE
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {data.top.length === 0 && (
            <p className="font-code text-sm text-gray-400 text-center py-6">
              No results yet. Be the first on the board!
            </p>
          )}

          {data.top.map((entry, i) => (
            <LeaderboardRow
              key={`${entry.username}-${i}`}
              rank={i + 1}
              username={entry.username}
              wins={entry.wins}
              losses={entry.losses}
              currentStreak={entry.currentStreak}
              bestStreak={entry.bestStreak}
            />
          ))}

          {data.self && (
            <>
              <div
                className="my-1 text-center font-pixel text-[9px] text-gray-600 tracking-widest"
                aria-hidden="true"
              >
                • • •
              </div>
              <LeaderboardRow
                rank={data.self.rank}
                username={data.self.username}
                wins={data.self.wins}
                losses={data.self.losses}
                currentStreak={data.self.currentStreak}
                bestStreak={data.self.bestStreak}
                highlight
              />
            </>
          )}
        </div>
      )}
    </BaseModal>
  );
};
