import { m } from "framer-motion";
import { BookOpen, Flame, Target, Swords, CalendarDays } from "lucide-react";
import { DICT_LABELS } from "../../lib/challenge";
import type { ChallengeConfig } from "../../lib/challenge";
import type { DuelConfig } from "../../lib/duel";
import type { DailyConfig } from "../../lib/daily";
import type { GameMode } from "../../lib/gameMode";
import React from "react";
import strings from "../../constants/strings";

const BannerFrame = ({ children }: { children: React.ReactNode }) => (
  <m.div
    initial={{ opacity: 0, y: -6 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
    className="mx-auto mb-4 max-w-sm w-full px-4 py-2.5"
    style={{
      background: "rgba(80,0,170,0.48)",
      border: "3px solid #7020cc",
      borderRadius: 16,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
    }}
  >
    {children}
  </m.div>
);

const BannerLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-pixel text-xs text-crown-amber tracking-widest text-center mb-2">
    {children}
  </p>
);

const BannerStat = ({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <span className="flex items-center gap-1 font-code text-xs text-gray-400">
    {icon}
    {children}
  </span>
);

const BannerDivider = () => (
  <span className="w-1.5 h-1.5 rounded-full bg-gray-500 shrink-0" />
);

const ChallengeBanner = ({ config }: { config: ChallengeConfig }) => (
  <BannerFrame>
    <BannerLabel>{strings.BANNER_LABEL_CUSTOM_CHALLENGE}</BannerLabel>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <BannerStat icon={<BookOpen className="w-3 h-3 text-crown-amber" />}>
        {strings.BANNER_DICTIONARY_TEXT(DICT_LABELS[config.dict])}
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<Target className="w-3 h-3 text-crown-amber" />}>
        {strings.CHALLENGE_CREATOR_GUESSES_TEXT(config.guesses)}
      </BannerStat>
    </div>
  </BannerFrame>
);

const DuelBanner = ({ config }: { config: DuelConfig }) => (
  <BannerFrame>
    <BannerLabel>{strings.BANNER_LABEL_DUEL}</BannerLabel>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <BannerStat icon={<BookOpen className="w-3 h-3 text-crown-amber" />}>
        {strings.BANNER_DICTIONARY_TEXT(DICT_LABELS[config.dict])}
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<Target className="w-3 h-3 text-crown-amber" />}>
        {strings.CHALLENGE_CREATOR_GUESSES_TEXT(config.guesses)}
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<Swords className="w-3 h-3 text-crown-amber" />}>
        {strings.BANNER_DUEL_WINDOW_TEXT}
      </BannerStat>
    </div>
  </BannerFrame>
);

const DailyBanner = ({
  config,
  dailyNumber,
  streak,
  usernameWarning,
}: {
  config: DailyConfig;
  dailyNumber: number;
  streak: number;
  usernameWarning: string | null;
}) => (
  <BannerFrame>
    <BannerLabel>
      {strings.BANNER_LABEL_DAILY_PREFIX}
      {dailyNumber}
    </BannerLabel>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <BannerStat icon={<BookOpen className="w-3 h-3 text-crown-amber" />}>
        {config.hardMode
          ? strings.BANNER_DIFFICULTY_HARD_TEXT
          : strings.BANNER_DIFFICULTY_NORMAL_TEXT}
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<CalendarDays className="w-3 h-3 text-crown-amber" />}>
        {strings.BANNER_DAILY_ATTEMPT_TEXT}
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<Flame className="w-3 h-3 text-crown-amber" />}>
        {strings.DAILY_MODAL_STREAK_DAYS_TEXT(streak)}
      </BannerStat>
    </div>
    {usernameWarning && (
      <p
        className="mt-2 font-code text-[11px] text-center"
        style={{ color: "rgba(212,175,55,0.75)" }}
      >
        &#9888; {usernameWarning}
      </p>
    )}
  </BannerFrame>
);

type Props = {
  gameMode: GameMode;
  challengeConfig: ChallengeConfig | null;
  duelConfig: DuelConfig | null;
  dailyConfig: DailyConfig | null;
  dailyNumber: number;
  dailyStreak: number;
  usernameWarning: string | null;
};

export const GameBanner = ({
  gameMode,
  challengeConfig,
  duelConfig,
  dailyConfig,
  dailyNumber,
  dailyStreak,
  usernameWarning,
}: Props) => {
  if (gameMode === "challenge" && challengeConfig)
    return <ChallengeBanner config={challengeConfig} />;
  if (gameMode === "duel" && duelConfig)
    return <DuelBanner config={duelConfig} />;
  if (gameMode === "daily" && dailyConfig)
    return (
      <DailyBanner
        config={dailyConfig}
        dailyNumber={dailyNumber}
        streak={dailyStreak}
        usernameWarning={usernameWarning}
      />
    );
  return null;
};
