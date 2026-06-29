import { motion } from "framer-motion";
import { BookOpen, Hash, Target, Swords } from "lucide-react";
import { DICT_LABELS } from "../lib/challenge";
import type { ChallengeConfig } from "../lib/challenge";
import type { DuelConfig } from "../lib/duel";

type Props = {
  isChallengeMode: boolean;
  challengeConfig: ChallengeConfig | null;
  isDuelMode: boolean;
  duelConfig: DuelConfig | null;
};

export const GameBanner = ({
  isChallengeMode,
  challengeConfig,
  isDuelMode,
  duelConfig,
}: Props) => (
  <>
    {isChallengeMode && challengeConfig && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mb-4 max-w-sm w-full px-4 py-2.5"
        style={{
          background: "rgba(80,0,170,0.45)",
          border: "1px solid rgba(80,0,170,0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <p className="font-pixel text-[9px] text-crown-amber tracking-widest text-center mb-1.5">
          CUSTOM CHALLENGE
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <Hash className="w-3 h-3 text-crown-amber" />
            {challengeConfig.length} letters
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <BookOpen className="w-3 h-3 text-crown-amber" />
            {DICT_LABELS[challengeConfig.dict]} word
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <Target className="w-3 h-3 text-crown-amber" />
            {challengeConfig.guesses} guesses
          </span>
        </div>
      </motion.div>
    )}

    {isDuelMode && duelConfig && (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mb-4 max-w-sm w-full px-4 py-2.5"
        style={{
          background: "rgba(80,0,170,0.45)",
          border: "1px solid rgba(80,0,170,0.6)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
      >
        <p className="font-pixel text-[9px] text-crown-amber tracking-widest text-center mb-1.5">
          DUEL
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <Hash className="w-3 h-3 text-crown-amber" />
            {duelConfig.length} letters
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <BookOpen className="w-3 h-3 text-crown-amber" />
            {DICT_LABELS[duelConfig.dict]} word
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <Target className="w-3 h-3 text-crown-amber" />
            {duelConfig.guesses} guesses
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <Swords className="w-3 h-3 text-crown-amber" />
            24h
          </span>
        </div>
      </motion.div>
    )}
  </>
);
