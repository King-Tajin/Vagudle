import { m } from "framer-motion";
import { BookOpen, Hash, Target, Swords, CalendarDays } from "lucide-react";
import { DICT_LABELS } from "../lib/challenge";
import type { ChallengeConfig } from "../lib/challenge";
import type { DuelConfig } from "../lib/duel";
import type { DailyConfig } from "../lib/daily";
import type { GameMode } from "../lib/gameMode";

const BannerFrame = ({ children }: { children: React.ReactNode }) => (
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
    {children}
  </m.div>
);

const BannerLabel = ({ children }: { children: React.ReactNode }) => (
  <p className="font-pixel text-[9px] text-crown-amber tracking-widest text-center mb-1.5">
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
  <span className="font-code text-xs text-gray-600">&middot;</span>
);

export const ChallengeBanner = ({ config }: { config: ChallengeConfig }) => (
  <BannerFrame>
    <BannerLabel>CUSTOM CHALLENGE</BannerLabel>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <BannerStat icon={<Hash className="w-3 h-3 text-crown-amber" />}>
        {config.length} letters
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<BookOpen className="w-3 h-3 text-crown-amber" />}>
        {DICT_LABELS[config.dict]} word
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<Target className="w-3 h-3 text-crown-amber" />}>
        {config.guesses} guesses
      </BannerStat>
    </div>
  </BannerFrame>
);

export const DuelBanner = ({ config }: { config: DuelConfig }) => (
  <BannerFrame>
    <BannerLabel>DUEL</BannerLabel>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <BannerStat icon={<Hash className="w-3 h-3 text-crown-amber" />}>
        {config.length} letters
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<BookOpen className="w-3 h-3 text-crown-amber" />}>
        {DICT_LABELS[config.dict]} word
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<Target className="w-3 h-3 text-crown-amber" />}>
        {config.guesses} guesses
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<Swords className="w-3 h-3 text-crown-amber" />}>
        24h
      </BannerStat>
    </div>
  </BannerFrame>
);

export const DailyBanner = ({
  config,
  dailyNumber,
  usernameWarning,
}: {
  config: DailyConfig;
  dailyNumber: number;
  usernameWarning: string | null;
}) => (
  <BannerFrame>
    <BannerLabel>DAILY #{dailyNumber}</BannerLabel>
    <div className="flex items-center justify-center gap-3 flex-wrap">
      <BannerStat icon={<Hash className="w-3 h-3 text-crown-amber" />}>
        {config.wordLength} letters
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<BookOpen className="w-3 h-3 text-crown-amber" />}>
        {config.hardMode ? "Hard" : "Normal"}
      </BannerStat>
      <BannerDivider />
      <BannerStat icon={<CalendarDays className="w-3 h-3 text-crown-amber" />}>
        1 attempt/day
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
  usernameWarning: string | null;
};

export const GameBanner = ({
  gameMode,
  challengeConfig,
  duelConfig,
  dailyConfig,
  dailyNumber,
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
        usernameWarning={usernameWarning}
      />
    );
  return null;
};
