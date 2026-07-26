import { m } from "framer-motion";
import { BookOpen, Hash, Target, Swords, CalendarDays } from "lucide-react";
import { DICT_LABELS } from "../lib/challenge";
import type { ChallengeConfig } from "../lib/challenge";
import type { DuelConfig } from "../lib/duel";
import type { DailyConfig } from "../lib/daily";

type Props = {
  isChallengeMode: boolean;
  challengeConfig: ChallengeConfig | null;
  isDuelMode: boolean;
  duelConfig: DuelConfig | null;
  isDailyMode: boolean;
  dailyConfig: DailyConfig | null;
  dailyNumber: number;
  isSignedIn: boolean;
  hasUsername: boolean | null;
};

export const GameBanner = ({
  isChallengeMode,
  challengeConfig,
  isDuelMode,
  duelConfig,
  isDailyMode,
  dailyConfig,
  dailyNumber,
  isSignedIn,
  hasUsername,
}: Props) => (
  <>
    {isChallengeMode && challengeConfig && (
      <m.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mb-4 max-w-sm w-full px-4 py-2.5"
        style={{
          background: "rgba(80,0,170,0.48)",
          border: "1px solid rgba(80,0,170,0.65)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
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
      </m.div>
    )}

    {isDuelMode && duelConfig && (
      <m.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mb-4 max-w-sm w-full px-4 py-2.5"
        style={{
          background: "rgba(80,0,170,0.48)",
          border: "1px solid rgba(80,0,170,0.65)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
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
      </m.div>
    )}

    {isDailyMode && dailyConfig && (
      <m.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-auto mb-4 max-w-sm w-full px-4 py-2.5"
        style={{
          background: "rgba(80,0,170,0.48)",
          border: "1px solid rgba(80,0,170,0.65)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        <p className="font-pixel text-[9px] text-crown-amber tracking-widest text-center mb-1.5">
          DAILY #{dailyNumber}
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <Hash className="w-3 h-3 text-crown-amber" />
            {dailyConfig.wordLength} letters
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <BookOpen className="w-3 h-3 text-crown-amber" />
            {dailyConfig.hardMode ? "Hard" : "Normal"}
          </span>
          <span className="font-code text-xs text-gray-600">·</span>
          <span className="flex items-center gap-1 font-code text-xs text-gray-400">
            <CalendarDays className="w-3 h-3 text-crown-amber" />1 attempt/day
          </span>
        </div>
        {(!isSignedIn || hasUsername === false) && (
          <p
            className="mt-2 font-code text-[11px] text-center"
            style={{ color: "rgba(212,175,55,0.75)" }}
          >
            ⚠{" "}
            {isSignedIn
              ? "Set a username to save to the leaderboard"
              : "Sign in to save to the leaderboard"}
          </p>
        )}
      </m.div>
    )}
  </>
);
