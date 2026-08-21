import { Copy, Check, Share2 } from "lucide-react";
import { DICT_LABELS, type ChallengeDict } from "../../../../lib/challenge";
import { BackButton } from "../Controls";
import type { Generated } from "../challengeLogic";

export const ResultView = ({
  generated,
  dict,
  guesses,
  copied,
  shared,
  onBack,
  onCopy,
  onShare,
  onEdit,
}: {
  generated: Generated;
  dict: ChallengeDict;
  guesses: 9 | 11;
  copied: boolean;
  shared: boolean;
  onBack?: () => void;
  onCopy: () => void;
  onShare: () => void;
  onEdit: () => void;
}) => {
  return (
    <div className="space-y-3">
      {onBack && <BackButton onClick={onBack} />}
      <div
        className="p-3"
        style={{
          background: "rgba(80,0,170,0.12)",
          border: "1px solid rgba(80,0,170,0.4)",
        }}
      >
        <p className="font-pixel text-[9px] text-gray-500 tracking-widest mb-1">
          CHALLENGE READY
        </p>
        <p className="font-pixel text-xl text-crown-gold tracking-widest crown-glow">
          {generated.word}
        </p>
        <div className="flex gap-3 mt-2">
          <span className="font-code text-xs text-gray-400">
            {generated.word.length} letters
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="font-code text-xs text-gray-400">
            {DICT_LABELS[dict]}
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="font-code text-xs text-gray-400">
            {guesses} guesses
          </span>
        </div>
      </div>
      <div
        className="px-3 py-2"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="font-code text-xs text-gray-400 truncate">
          {generated.url}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 py-2.5 font-pixel text-xs tracking-widest flex items-center justify-center gap-1.5 transition-colors"
          style={{
            background: copied ? "rgba(74,124,63,0.2)" : "rgba(255,215,0,0.1)",
            border: `2px solid ${copied ? "#4a7c3f" : "#d4af37"}`,
            color: copied ? "#4ade80" : "#d4af37",
          }}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              COPIED!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              COPY
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onShare}
          className="flex-1 py-2.5 font-pixel text-xs tracking-widest flex items-center justify-center gap-1.5 transition-colors"
          style={{
            background: shared ? "rgba(74,124,63,0.2)" : "rgba(80,0,170,0.15)",
            border: `2px solid ${shared ? "#4a7c3f" : "#5000aa"}`,
            color: shared ? "#4ade80" : "#a78bfa",
          }}
        >
          {shared ? (
            <>
              <Check className="w-3 h-3" />
              SHARED!
            </>
          ) : (
            <>
              <Share2 className="w-3 h-3" />
              SHARE
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onEdit}
          className="px-4 py-2.5 font-pixel text-xs tracking-widest transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "2px solid rgba(255,255,255,0.1)",
            color: "#6b7280",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
            e.currentTarget.style.color = "#9ca3af";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          EDIT
        </button>
      </div>
    </div>
  );
};
