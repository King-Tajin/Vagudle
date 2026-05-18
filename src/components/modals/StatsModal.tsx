import { useState } from "react";
import { StatBar } from "../stats/StatBar";
import { Histogram } from "../stats/Histogram";
import { GameStats } from "../../lib/localStorage";
import { shareStatus, shareStats } from "../../lib/share";
import { BaseModal } from "./BaseModal";
import { Share2, RotateCcw, BookOpen, Hash, Target } from "lucide-react";
import {
  STATISTICS_TITLE,
  GUESS_DISTRIBUTION_TEXT,
} from "../../constants/strings";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../../constants/settings";
import {
  DICT_LABELS,
  DICT_DESCRIPTIONS,
  type ChallengeConfig,
} from "../../lib/challenge";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  solution: string;
  guesses: string[];
  gameStats: GameStats;
  hardGameStats: GameStats;
  isGameLost: boolean;
  isGameWon: boolean;
  handleShareToClipboard: () => void;
  numberOfGuessesMade: number;
  handleNewGame: () => void;
  hardMode: boolean;
  challengeConfig?: ChallengeConfig | null;
  handleReturnToNormal?: () => void;
};

const shareChallengeInvite = async (
  config: ChallengeConfig,
  handleShareToClipboard: () => void
) => {
  const text =
    `I'm challenging you to a custom Vagudle!\n` +
    `${config.length} letters · ${DICT_LABELS[config.dict]} dictionary · ${
      config.guesses
    } guesses\n` +
    `(Results won't affect your stats)\n` +
    window.location.href;

  try {
    if (
      typeof navigator.share === "function" &&
      navigator.canShare?.({ text })
    ) {
      await navigator.share({ title: "Vagudle Challenge", text });
      return;
    }
  } catch {}

  try {
    await navigator.clipboard.writeText(text);
    handleShareToClipboard();
  } catch {}
};

export const StatsModal = ({
  isOpen,
  handleClose,
  solution,
  guesses,
  gameStats,
  hardGameStats,
  isGameLost,
  isGameWon,
  handleShareToClipboard,
  numberOfGuessesMade,
  handleNewGame,
  hardMode,
  challengeConfig,
  handleReturnToNormal,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"normal" | "hard">(
    hardMode ? "hard" : "normal"
  );

  const displayStats = activeTab === "hard" ? hardGameStats : gameStats;
  const tabMaxChallenges =
    activeTab === "hard"
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
  const gameMaxChallenges = hardMode
    ? HARD_MODE_MAX_CHALLENGES
    : NORMAL_MODE_MAX_CHALLENGES;
  const isCurrentTab = activeTab === (hardMode ? "hard" : "normal");
  const hasGames = displayStats.totalGames > 0;

  const tabBase =
    "flex-1 py-2 font-pixel text-xs tracking-widest transition-all";
  const activeTabStyle = {
    background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
    border: "2px solid #5000aa",
    color: "#fff",
  };
  const inactiveTabStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "2px solid rgba(255,255,255,0.1)",
    color: "#6b7280",
  };

  if (challengeConfig) {
    const score = isGameLost ? "X" : guesses.length;
    const maxG = challengeConfig.guesses;

    return (
      <BaseModal
        title="Challenge Result"
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <div
          className="p-3 mb-4 space-y-2"
          style={{
            background: "rgba(80,0,170,0.1)",
            border: "1px solid rgba(80,0,170,0.35)",
          }}
        >
          <p className="font-pixel text-xs text-crown-amber tracking-widest">
            CUSTOM CHALLENGE
          </p>
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-code text-xs text-gray-300">
              {challengeConfig.length} letters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-code text-xs text-gray-300">
              {DICT_LABELS[challengeConfig.dict]} dictionary —{" "}
              <span className="text-gray-500">
                {DICT_DESCRIPTIONS[challengeConfig.dict]}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-code text-xs text-gray-300">
              {challengeConfig.guesses} guesses allowed
            </span>
          </div>
        </div>

        {isGameWon && (
          <div className="text-center py-3">
            <p className="font-pixel text-xs text-tajin-lime tracking-widest">
              CHALLENGE COMPLETE!
            </p>
            <p className="font-code text-sm text-gray-300 mt-1">
              Solved in{" "}
              <span className="text-crown-gold font-bold">
                {score}/{maxG}
              </span>{" "}
              guesses
            </p>
          </div>
        )}

        {isGameLost && (
          <div className="text-center py-3">
            <p className="font-pixel text-xs text-tajin-red tracking-widest">
              CHALLENGE FAILED
            </p>
            <p className="font-code text-sm text-gray-400 mt-1">
              Better luck next time!
              You can always ask the sender for the answer.
            </p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          {handleReturnToNormal && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(255,255,255,0.12)",
                color: "#9ca3af",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
              onClick={handleReturnToNormal}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              LEAVE
            </button>
          )}

          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
            style={{
              background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
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
              shareChallengeInvite(challengeConfig, handleShareToClipboard)
            }
          >
            <Share2 className="w-3.5 h-3.5" />
            SHARE
          </button>
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      title={STATISTICS_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="flex gap-2 mb-4">
        <button
          className={tabBase}
          style={activeTab === "normal" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("normal")}
        >
          NORMAL
        </button>
        <button
          className={tabBase}
          style={activeTab === "hard" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("hard")}
        >
          HARD
        </button>
      </div>

      {hasGames ? (
        <>
          <StatBar gameStats={displayStats} />

          <p className="font-pixel text-xs text-gray-500 tracking-widest mt-4 mb-3">
            {GUESS_DISTRIBUTION_TEXT.toUpperCase()}
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

      {hasGames && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 font-pixel text-xs tracking-wider transition-all"
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
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
            style={{
              background: "linear-gradient(180deg, #3a7d44 0%, #2d6135 100%)",
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

          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
            style={{
              background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
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
        </div>
      )}
    </BaseModal>
  );
};
