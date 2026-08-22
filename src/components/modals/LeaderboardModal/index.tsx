import {
  Loader,
  Pencil,
  ChevronLeft,
  ChevronRight,
  MapPin,
} from "lucide-react";
import { BaseModal } from "../BaseModal";
import { MODAL_TITLE_DAILY_LEADERBOARD } from "../../../constants/strings";
import { useLeaderboardData, formatCooldown } from "./useLeaderboardData";
import { LeaderboardRow } from "./LeaderboardRow";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  idToken: string | null;
  onOpenSettings: () => void;
  onUsernameSaved: () => Promise<void>;
  isActivityMode: boolean;
};

export const LeaderboardModal = ({
  isOpen,
  handleClose,
  idToken,
  onOpenSettings,
  onUsernameSaved,
  isActivityMode,
}: Props) => {
  const {
    status,
    data,
    usernameStatus,
    isEditing,
    inputValue,
    isSubmitting,
    submitError,
    isPageLoading,
    selfPage,
    dispatch,
    goToPage,
    handleSubmitUsername,
  } = useLeaderboardData({ isOpen, idToken, onUsernameSaved });

  return (
    <BaseModal
      title={MODAL_TITLE_DAILY_LEADERBOARD}
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
          {!idToken && !isActivityMode && (
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
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-code text-sm text-gray-200 truncate">
                      Playing as{" "}
                      <span className="text-crown-amber">
                        {usernameStatus.username}
                      </span>
                    </p>
                    {!usernameStatus.canChangeAt && (
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
                  {usernameStatus.canChangeAt && (
                    <p className="font-code text-xs text-gray-500 mt-1">
                      Please wait {formatCooldown(usernameStatus.canChangeAt)}{" "}
                      before changing your username.
                    </p>
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

          <div
            className="space-y-2 transition-opacity"
            style={{ opacity: isPageLoading ? 0.5 : 1 }}
          >
            {data.top.map((entry, i) => (
              <LeaderboardRow
                key={entry.username}
                rank={(data.page - 1) * data.pageSize + i + 1}
                username={entry.username}
                wins={entry.wins}
                losses={entry.losses}
                currentStreak={entry.currentStreak}
                bestStreak={entry.bestStreak}
              />
            ))}
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => void goToPage(data.page - 1)}
                disabled={data.page <= 1 || isPageLoading}
                className="flex items-center gap-1 px-2 py-1.5 font-pixel text-[9px] tracking-widest text-gray-400 hover:text-crown-amber disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                <ChevronLeft className="w-3 h-3" />
                PREV
              </button>
              <p className="font-code text-xs text-gray-500">
                Page {data.page} / {data.totalPages}
              </p>
              <button
                type="button"
                onClick={() => void goToPage(data.page + 1)}
                disabled={data.page >= data.totalPages || isPageLoading}
                className="flex items-center gap-1 px-2 py-1.5 font-pixel text-[9px] tracking-widest text-gray-400 hover:text-crown-amber disabled:opacity-30 disabled:hover:text-gray-400 transition-colors"
              >
                NEXT
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}

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
              {selfPage !== null && selfPage !== data.page && (
                <button
                  type="button"
                  onClick={() => void goToPage(selfPage)}
                  disabled={isPageLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 font-pixel text-[9px] tracking-widest text-gray-400 hover:text-crown-amber disabled:opacity-30 transition-colors"
                >
                  <MapPin className="w-3 h-3" />
                  JUMP TO MY PAGE
                </button>
              )}
            </>
          )}
        </div>
      )}
    </BaseModal>
  );
};
