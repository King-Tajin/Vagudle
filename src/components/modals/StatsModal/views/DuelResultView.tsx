import { BaseModal } from "../../BaseModal";
import { RotateCcw, Hash, BookOpen, Target } from "lucide-react";
import { DICT_LABELS, DICT_DESCRIPTIONS } from "../../../../lib/challenge";
import type { DuelConfig } from "../../../../lib/duel";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  duelConfig: DuelConfig;
  solution: string;
  guesses: string[];
  isGameWon: boolean;
  isGameLost: boolean;
  handleDuelReturn?: () => void;
};

export const DuelResultView = ({
  isOpen,
  handleClose,
  duelConfig,
  solution,
  guesses,
  isGameWon,
  isGameLost,
  handleDuelReturn,
}: Props) => {
  const score = isGameLost ? "X" : guesses.length;

  return (
    <BaseModal title="Duel Result" isOpen={isOpen} handleClose={handleClose}>
      <div
        className="p-3 mb-4 space-y-2"
        style={{
          background: "rgba(80,0,170,0.1)",
          border: "1px solid rgba(80,0,170,0.35)",
        }}
      >
        <p className="font-pixel text-xs text-crown-amber tracking-widest">
          DUEL
        </p>
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {duelConfig.length ?? solution.length} letters
          </span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {DICT_LABELS[duelConfig.dict]} dictionary —{" "}
            <span className="text-gray-500">
              {DICT_DESCRIPTIONS[duelConfig.dict]}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          <span className="font-code text-xs text-gray-300">
            {duelConfig.guesses} guesses allowed
          </span>
        </div>
      </div>

      {isGameWon && (
        <div className="text-center py-3">
          <p className="font-pixel text-xs text-spice-lime tracking-widest">
            DUEL COMPLETE!
          </p>
          <p className="font-code text-sm text-gray-300 mt-1">
            Solved in <span className="text-crown-gold font-bold">{score}</span>{" "}
            guesses
          </p>
        </div>
      )}
      {isGameLost && (
        <div className="text-center py-3">
          <p className="font-pixel text-xs text-spice-red tracking-widest">
            DUEL FAILED
          </p>
          <p className="font-code text-sm text-gray-400 mt-1">
            Better luck next time!
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
            LEAVE
          </button>
        </div>
      )}
    </BaseModal>
  );
};
