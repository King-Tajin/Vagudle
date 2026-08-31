import { BaseModal } from "../../BaseModal";
import { RotateCcw, Hash, BookOpen, Target } from "lucide-react";
import { DICT_LABELS, DICT_DESCRIPTIONS } from "../../../../lib/challenge";
import type { DuelConfig } from "../../../../lib/duel";
import type { GameOutcome } from "../../../../lib/gameOutcome";
import {
  DUEL_RESULT_MODAL_TITLE,
  DUEL_RESULT_HEADING,
  DAILY_SCHEDULE_WORD_LENGTH_TEXT,
  CHALLENGE_DICTIONARY_SUFFIX_TEXT,
  CHALLENGE_GUESSES_ALLOWED_TEXT,
  DUEL_RESULT_COMPLETE_TEXT,
  RESULT_SOLVED_TEXT_BEFORE,
  RESULT_SOLVED_TEXT_AFTER,
  DUEL_RESULT_FAILED_TEXT,
  DUEL_RESULT_FAILED_DESCRIPTION,
  RESULT_LEAVE_BUTTON_TEXT,
} from "../../../../constants/strings";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  duelConfig: DuelConfig;
  solution: string;
  guesses: string[];
  gameOutcome: GameOutcome;
  handleDuelReturn?: () => void;
};

export const DuelResultView = ({
  isOpen,
  handleClose,
  duelConfig,
  solution,
  guesses,
  gameOutcome,
  handleDuelReturn,
}: Props) => {
  const score = gameOutcome === "lost" ? "X" : guesses.length;

  return (
    <BaseModal
      title={DUEL_RESULT_MODAL_TITLE}
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
          {DUEL_RESULT_HEADING}
        </p>
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {DAILY_SCHEDULE_WORD_LENGTH_TEXT(
              duelConfig.length ?? solution.length
            )}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {DICT_LABELS[duelConfig.dict]} {CHALLENGE_DICTIONARY_SUFFIX_TEXT}{" "}
            <span className="text-gray-500">
              {DICT_DESCRIPTIONS[duelConfig.dict]}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {CHALLENGE_GUESSES_ALLOWED_TEXT(duelConfig.guesses)}
          </span>
        </div>
      </div>

      {gameOutcome === "won" && (
        <div className="text-center py-3">
          <p className="font-pixel text-xs text-spice-lime tracking-widest">
            {DUEL_RESULT_COMPLETE_TEXT}
          </p>
          <p className="font-code text-sm text-gray-300 mt-1">
            {RESULT_SOLVED_TEXT_BEFORE}{" "}
            <span className="text-crown-gold font-bold">{score}</span>{" "}
            {RESULT_SOLVED_TEXT_AFTER}
          </p>
        </div>
      )}
      {gameOutcome === "lost" && (
        <div className="text-center py-3">
          <p className="font-pixel text-xs text-spice-red tracking-widest">
            {DUEL_RESULT_FAILED_TEXT}
          </p>
          <p className="font-code text-sm text-gray-400 mt-1">
            {DUEL_RESULT_FAILED_DESCRIPTION}
          </p>
        </div>
      )}

      {handleDuelReturn && (
        <div className="mt-3">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-colors"
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
            onClick={handleDuelReturn}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {RESULT_LEAVE_BUTTON_TEXT}
          </button>
        </div>
      )}
    </BaseModal>
  );
};
