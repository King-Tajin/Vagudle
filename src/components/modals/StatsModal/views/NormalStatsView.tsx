import { BaseModal } from "../../BaseModal";
import { StatBar } from "../../../stats/StatBar";
import { Histogram } from "../../../stats/Histogram";
import { Share2, RotateCcw, Swords } from "lucide-react";
import { shareStatus, shareStats } from "../../../../lib/share";
import { type GameStats } from "../../../../lib/localStorage";
import {
  STATISTICS_TITLE,
  GUESS_DISTRIBUTION_TEXT,
} from "../../../../constants/strings";

const TAB_ACTIVE_STYLE = {
  background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
  border: "2px solid #5000aa",
  color: "#fff",
};
const TAB_INACTIVE_STYLE = {
  background: "rgba(255,255,255,0.03)",
  border: "2px solid rgba(255,255,255,0.1)",
  color: "#6b7280",
};
const TAB_BASE =
  "flex-1 py-2 font-pixel text-xs tracking-widest transition-colors";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  activeTab: "normal" | "hard";
  setActiveTab: (tab: "normal" | "hard") => void;
  displayStats: GameStats;
  tabMaxChallenges: number;
  isGameWon: boolean;
  isCurrentTab: boolean;
  numberOfGuessesMade: number;
  hasGames: boolean;
  isActivityMode: boolean;
  handleShareToClipboard: () => void;
  isGameLost: boolean;
  handleNewGame: () => void;
  solution: string;
  guesses: string[];
  hardMode: boolean;
  gameMaxChallenges: number;
  onOpenChallengeCreator: () => void;
};

export const NormalStatsView = ({
  isOpen,
  handleClose,
  activeTab,
  setActiveTab,
  displayStats,
  tabMaxChallenges,
  isGameWon,
  isCurrentTab,
  numberOfGuessesMade,
  hasGames,
  isActivityMode,
  handleShareToClipboard,
  isGameLost,
  handleNewGame,
  solution,
  guesses,
  hardMode,
  gameMaxChallenges,
  onOpenChallengeCreator,
}: Props) => {
  return (
    <BaseModal
      title={STATISTICS_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className={TAB_BASE}
          style={activeTab === "normal" ? TAB_ACTIVE_STYLE : TAB_INACTIVE_STYLE}
          onClick={() => setActiveTab("normal")}
        >
          NORMAL
        </button>
        <button
          type="button"
          className={TAB_BASE}
          style={activeTab === "hard" ? TAB_ACTIVE_STYLE : TAB_INACTIVE_STYLE}
          onClick={() => setActiveTab("hard")}
        >
          HARD
        </button>
      </div>
      {hasGames ? (
        <>
          <StatBar gameStats={displayStats} />
          <p className="font-pixel text-xs text-gray-500 tracking-widest mt-4 mb-3">
            {GUESS_DISTRIBUTION_TEXT.toUpperCase()} -{" "}
            {displayStats.totalGames - displayStats.gamesFailed} GAME
            {displayStats.totalGames - displayStats.gamesFailed === 1
              ? ""
              : "S"}{" "}
            WON
          </p>
          <Histogram
            gameStats={displayStats}
            isGameWon={isGameWon && isCurrentTab}
            numberOfGuessesMade={numberOfGuessesMade}
            maxChallenges={tabMaxChallenges}
          />
        </>
      ) : (
        <div className="py-8 flex flex-col items-center gap-2">
          <p className="font-pixel text-xs text-crown-amber tracking-widest">
            NO GAMES YET
          </p>
          <p className="font-code text-xs text-gray-500 text-center">
            {activeTab === "hard"
              ? "Play a game in Hard Mode to see stats here."
              : "Play a game to see stats here."}
          </p>
        </div>
      )}
      {hasGames && !isActivityMode && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 font-pixel text-xs tracking-wider transition-colors"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.25)",
              color: "#d4af37",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onClick={() =>
              shareStats(
                displayStats,
                activeTab === "hard",
                handleShareToClipboard
              )
            }
          >
            <Share2 className="w-3 h-3" />
            SHARE STATS
          </button>
        </div>
      )}
      {(isGameLost || isGameWon) && (
        <>
          <div
            className={`mt-3 ${isActivityMode ? "" : "grid grid-cols-2 gap-3"}`}
          >
            {!isActivityMode && (
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
                style={{
                  background:
                    "linear-gradient(180deg, #3a7d44 0%, #2d6135 100%)",
                  border: "2px solid #3a7d44",
                  color: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
                onClick={handleNewGame}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                NEW GAME
              </button>
            )}
            {!isActivityMode && (
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
                style={{
                  background:
                    "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
                  border: "2px solid #5000aa",
                  color: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
                onClick={() =>
                  shareStatus(
                    solution,
                    guesses,
                    isGameLost,
                    handleShareToClipboard,
                    hardMode,
                    gameMaxChallenges
                  )
                }
              >
                <Share2 className="w-3.5 h-3.5" />
                SHARE GAME
              </button>
            )}
          </div>

          <button
            type="button"
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "2px solid rgba(255,215,0,0.35)",
              color: "#d4af37",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onClick={onOpenChallengeCreator}
          >
            <Swords className="w-3.5 h-3.5" />
            CHALLENGE OTHERS WITH THIS WORD
          </button>
        </>
      )}
    </BaseModal>
  );
};
