import { useEffect, useReducer } from "react";
import { Loader, Pencil } from "lucide-react";
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
  onOpenSettings: () => void;
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

type LeaderboardState = {
  status: "loading" | "error" | "loaded";
  data: DailyLeaderboardResponse | null;
  usernameStatus: UsernameStatus | null;
  isEditing: boolean;
  inputValue: string;
  isSubmitting: boolean;
  submitError: string | null;
};

const initialLeaderboardState: LeaderboardState = {
  status: "loading",
  data: null,
  usernameStatus: null,
  isEditing: false,
  inputValue: "",
  isSubmitting: false,
  submitError: null,
};

type LeaderboardAction =
  | { type: "loadStart" }
  | {
      type: "loadSuccess";
      data: DailyLeaderboardResponse;
      usernameStatus: UsernameStatus | null;
      isEditing: boolean;
      inputValue: string;
    }
  | { type: "loadError" }
  | { type: "submitStart" }
  | {
      type: "submitSuccess";
      usernameStatus: UsernameStatus;
      inputValue: string;
    }
  | { type: "refreshData"; data: DailyLeaderboardResponse }
  | { type: "submitError"; message: string }
  | { type: "setInputValue"; value: string }
  | { type: "startEditing" }
  | { type: "cancelEditing"; inputValue: string };

function leaderboardReducer(
  state: LeaderboardState,
  action: LeaderboardAction
): LeaderboardState {
  switch (action.type) {
    case "loadStart":
      return { ...state, status: "loading", submitError: null };
    case "loadSuccess":
      return {
        ...state,
        status: "loaded",
        data: action.data,
        usernameStatus: action.usernameStatus,
        isEditing: action.isEditing,
        inputValue: action.inputValue,
      };
    case "loadError":
      return { ...state, status: "error" };
    case "submitStart":
      return { ...state, isSubmitting: true, submitError: null };
    case "submitSuccess":
      return {
        ...state,
        isSubmitting: false,
        usernameStatus: action.usernameStatus,
        inputValue: action.inputValue,
        isEditing: false,
      };
    case "refreshData":
      return { ...state, data: action.data };
    case "submitError":
      return { ...state, isSubmitting: false, submitError: action.message };
    case "setInputValue":
      return { ...state, inputValue: action.value };
    case "startEditing":
      return { ...state, isEditing: true };
    case "cancelEditing":
      return {
        ...state,
        isEditing: false,
        inputValue: action.inputValue,
        submitError: null,
      };
  }
}

export const LeaderboardModal = ({
  isOpen,
  handleClose,
  idToken,
  onOpenSettings,
}: Props) => {
  const [
    {
      status,
      data,
      usernameStatus,
      isEditing,
      inputValue,
      isSubmitting,
      submitError,
    },
    dispatch,
  ] = useReducer(leaderboardReducer, initialLeaderboardState);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    const loadLeaderboard = async () => {
      dispatch({ type: "loadStart" });
      const [leaderboard, username] = await Promise.all([
        fetchDailyLeaderboard(idToken),
        idToken ? fetchUsernameStatus(idToken) : Promise.resolve(null),
      ]);
      if (cancelled) return;
      if (!leaderboard) {
        dispatch({ type: "loadError" });
        return;
      }
      dispatch({
        type: "loadSuccess",
        data: leaderboard,
        usernameStatus: username,
        isEditing: !!idToken && !username?.username,
        inputValue: username?.username ?? "",
      });
    };

    void loadLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [isOpen, idToken]);

  const handleSubmitUsername = async () => {
    if (!idToken || isSubmitting) return;
    const trimmed = inputValue.trim().replace(/\s+/g, " ");
    if (!USERNAME_PATTERN.test(trimmed)) {
      dispatch({
        type: "submitError",
        message: "3-20 characters: letters, numbers, spaces, - or _",
      });
      return;
    }

    dispatch({ type: "submitStart" });
    const outcome = await updateUsername(idToken, trimmed);

    if (outcome.status === "updated") {
      dispatch({
        type: "submitSuccess",
        usernameStatus: {
          username: outcome.username,
          canChangeAt: outcome.canChangeAt,
        },
        inputValue: outcome.username,
      });
      const refreshed = await fetchDailyLeaderboard(idToken);
      if (refreshed) dispatch({ type: "refreshData", data: refreshed });
      return;
    }

    if (outcome.status === "invalid")
      dispatch({
        type: "submitError",
        message: "3-20 characters: letters, numbers, spaces, - or _",
      });
    else if (outcome.status === "taken")
      dispatch({
        type: "submitError",
        message: "That username is already taken.",
      });
    else if (outcome.status === "rate_limited")
      dispatch({
        type: "submitError",
        message: `You can change your name again in ${formatCooldown(outcome.retryAt)}.`,
      });
    else
      dispatch({
        type: "submitError",
        message: "Something went wrong. Please try again.",
      });
  };

  return (
    <BaseModal
      title="Daily Leaderboard"
      isOpen={isOpen}
      handleClose={handleClose}
      maxWidthClass="sm:max-w-md"
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
          {!idToken && (
            <div
              className="mb-2 p-3"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <p className="font-code text-sm text-gray-300 text-center leading-relaxed">
                Sign in to save your name and appear on the leaderboard.
              </p>
              <button
                type="button"
                onClick={onOpenSettings}
                className="w-full mt-3 py-2 font-pixel text-[10px] tracking-widest transition-[filter]"
                style={{
                  background: "rgba(212,175,55,0.08)",
                  border: "2px solid rgba(212,175,55,0.4)",
                  color: "#d4af37",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
              >
                GO TO SETTINGS
              </button>
            </div>
          )}

          {idToken && usernameStatus && (
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
                      onChange={(e) =>
                        dispatch({
                          type: "setInputValue",
                          value: e.target.value,
                        })
                      }
                      maxLength={20}
                      placeholder="Your leaderboard name"
                      aria-label="Leaderboard username"
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
                        onClick={() =>
                          dispatch({
                            type: "cancelEditing",
                            inputValue: usernameStatus.username ?? "",
                          })
                        }
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
                      onClick={() => dispatch({ type: "startEditing" })}
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
              key={entry.username}
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
