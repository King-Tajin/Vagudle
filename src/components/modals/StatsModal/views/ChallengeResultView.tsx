import { BaseModal } from "../../BaseModal";
import { Share2, RotateCcw, Hash, BookOpen, Target } from "lucide-react";
import { shareChallengeInvite } from "../../../../lib/share";
import {
  DICT_LABELS,
  DICT_DESCRIPTIONS,
  type ChallengeConfig,
} from "../../../../lib/challenge";
import type { GameOutcome } from "../../../../lib/gameOutcome";
import strings from "../../../../constants/strings";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  challengeConfig: ChallengeConfig;
  guesses: string[];
  gameOutcome: GameOutcome;
  isActivityMode: boolean;
  handleReturnToNormal?: () => void;
  handleShareToClipboard: () => void;
};

export const ChallengeResultView = ({
  isOpen,
  handleClose,
  challengeConfig,
  guesses,
  gameOutcome,
  isActivityMode,
  handleReturnToNormal,
  handleShareToClipboard,
}: Props) => {
  const score = gameOutcome === "lost" ? "X" : guesses.length;
  const maxG = challengeConfig.guesses;

  return (
    <BaseModal
      title={strings.CHALLENGE_RESULT_MODAL_TITLE}
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
          {strings.CHALLENGE_RESULT_HEADING}
        </p>
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {strings.DAILY_SCHEDULE_WORD_LENGTH_TEXT(challengeConfig.length)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {DICT_LABELS[challengeConfig.dict]}{" "}
            {strings.CHALLENGE_DICTIONARY_SUFFIX_TEXT}{" "}
            <span className="text-gray-500">
              {DICT_DESCRIPTIONS[challengeConfig.dict]}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {strings.CHALLENGE_GUESSES_ALLOWED_TEXT(challengeConfig.guesses)}
          </span>
        </div>
      </div>

      {gameOutcome === "won" && (
        <div className="text-center py-3">
          <p className="font-pixel text-xs text-spice-lime tracking-widest">
            {strings.CHALLENGE_RESULT_COMPLETE_TEXT}
          </p>
          <p className="font-code text-sm text-gray-300 mt-1">
            {strings.RESULT_SOLVED_TEXT_BEFORE}{" "}
            <span className="text-crown-gold font-bold">
              {score}/{maxG}
            </span>{" "}
            {strings.RESULT_SOLVED_TEXT_AFTER}
          </p>
        </div>
      )}
      {gameOutcome === "lost" && (
        <div className="text-center py-3">
          <p className="font-pixel text-xs text-spice-red tracking-widest">
            {strings.CHALLENGE_RESULT_FAILED_TEXT}
          </p>
          <p className="font-code text-sm text-gray-400 mt-1">
            {strings.CHALLENGE_RESULT_FAILED_DESCRIPTION}
          </p>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-3">
        {handleReturnToNormal && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
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
            {strings.RESULT_LEAVE_BUTTON_TEXT}
          </button>
        )}
        {!isActivityMode && (
          <button
            type="button"
            className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
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
            {strings.CHALLENGE_RESULT_SHARE_BUTTON_TEXT}
          </button>
        )}
      </div>
    </BaseModal>
  );
};
