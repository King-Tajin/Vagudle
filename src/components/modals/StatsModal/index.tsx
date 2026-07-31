import { useState, useEffect, useRef } from "react";
import { type GameStats } from "../../../lib/localStorage";
import { BaseModal } from "../BaseModal";
import { ChallengeCreatorModal } from "../ChallengeCreatorModal";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../../../constants/settings";
import {
  type ChallengeConfig,
  type ChallengeDict,
} from "../../../lib/challenge";
import type { Achievement } from "../../../lib/achievements";
import { type BackgroundId } from "../../../lib/backgrounds";
import type { DuelConfig } from "../../../lib/duel";
import { playSadTrombone } from "../../../lib/sounds";
import { type GameOutcome } from "../../../lib/gameOutcome";
import { AchievementView } from "./views/AchievementView";
import { DuelResultView } from "./views/DuelResultView";
import { ChallengeResultView } from "./views/ChallengeResultView";
import { NormalStatsView } from "./views/NormalStatsView";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  solution: string;
  guesses: string[];
  gameStats: GameStats;
  hardGameStats: GameStats;
  gameOutcome: GameOutcome;
  handleShareToClipboard: () => void;
  numberOfGuessesMade: number;
  handleNewGame: () => void;
  hardMode: boolean;
  challengeConfig?: ChallengeConfig | null;
  handleReturnToNormal?: () => void;
  extraEffects?: boolean;
  handleDuelReturn?: () => void;
  duelConfig?: DuelConfig | null;
  isActivityMode?: boolean;
  newlyUnlockedAchievements?: Achievement[];
  onAchievementsViewed?: () => void;
  setBackgroundId?: (id: BackgroundId) => void;
};

export const StatsModal = ({
  isOpen,
  handleClose,
  solution,
  guesses,
  gameStats,
  hardGameStats,
  gameOutcome,
  handleShareToClipboard,
  numberOfGuessesMade,
  handleNewGame,
  hardMode,
  challengeConfig,
  handleReturnToNormal,
  extraEffects = true,
  handleDuelReturn,
  duelConfig,
  isActivityMode = false,
  newlyUnlockedAchievements = [],
  onAchievementsViewed,
  setBackgroundId,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"normal" | "hard">(
    hardMode ? "hard" : "normal"
  );
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [achievementIdx, setAchievementIdx] = useState(0);
  const hasPlayedSoundRef = useRef(false);
  const [prevResetKey, setPrevResetKey] = useState(`${isOpen}:${solution}`);
  const resetKey = `${isOpen}:${solution}`;

  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    if (isOpen) {
      setShowChallengeCreator(false);
      setAchievementIdx(0);
      setActiveTab(hardMode ? "hard" : "normal");
    }
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (
      isOpen &&
      gameOutcome === "lost" &&
      extraEffects &&
      !hasPlayedSoundRef.current &&
      newlyUnlockedAchievements.length === 0
    ) {
      hasPlayedSoundRef.current = true;
      timeoutId = setTimeout(() => playSadTrombone(), 200);
    }
    if (!isOpen) hasPlayedSoundRef.current = false;
    return () => clearTimeout(timeoutId);
  }, [isOpen, gameOutcome, extraEffects, newlyUnlockedAchievements.length]);

  const showingAchievement =
    !duelConfig &&
    !challengeConfig &&
    !showChallengeCreator &&
    newlyUnlockedAchievements.length > 0 &&
    achievementIdx < newlyUnlockedAchievements.length;

  const handleAchievementOkay = () => {
    if (achievementIdx < newlyUnlockedAchievements.length - 1) {
      setAchievementIdx((i) => i + 1);
    } else {
      onAchievementsViewed?.();
      setAchievementIdx(0);
    }
  };

  const displayStats = activeTab === "hard" ? hardGameStats : gameStats;
  const tabMaxChallenges =
    activeTab === "hard"
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
  const gameMaxChallenges = hardMode
    ? HARD_MODE_MAX_CHALLENGES
    : NORMAL_MODE_MAX_CHALLENGES;
  const presetDict: ChallengeDict = hardMode ? "hard" : "normal";
  const presetGuesses: 9 | 11 = hardMode ? 9 : 11;

  if (showingAchievement) {
    return (
      <AchievementView
        isOpen={isOpen}
        handleClose={handleClose}
        achievement={newlyUnlockedAchievements[achievementIdx]}
        achievementIdx={achievementIdx}
        totalAchievements={newlyUnlockedAchievements.length}
        handleShareToClipboard={handleShareToClipboard}
        handleAchievementOkay={handleAchievementOkay}
        setBackgroundId={setBackgroundId}
      />
    );
  }

  if (showChallengeCreator) {
    return (
      <BaseModal
        title="Create Challenge"
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <ChallengeCreatorModal
          autoFilledWord={solution}
          autoFilledDict={presetDict}
          autoFilledGuesses={presetGuesses}
          onBack={() => setShowChallengeCreator(false)}
        />
      </BaseModal>
    );
  }

  if (duelConfig) {
    return (
      <DuelResultView
        isOpen={isOpen}
        handleClose={handleClose}
        duelConfig={duelConfig}
        solution={solution}
        guesses={guesses}
        gameOutcome={gameOutcome}
        handleDuelReturn={handleDuelReturn}
      />
    );
  }

  if (challengeConfig) {
    return (
      <ChallengeResultView
        isOpen={isOpen}
        handleClose={handleClose}
        challengeConfig={challengeConfig}
        guesses={guesses}
        gameOutcome={gameOutcome}
        isActivityMode={isActivityMode}
        handleReturnToNormal={handleReturnToNormal}
        handleShareToClipboard={handleShareToClipboard}
      />
    );
  }

  return (
    <NormalStatsView
      isOpen={isOpen}
      handleClose={handleClose}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      displayStats={displayStats}
      tabMaxChallenges={tabMaxChallenges}
      gameOutcome={gameOutcome}
      numberOfGuessesMade={numberOfGuessesMade}
      isActivityMode={isActivityMode}
      handleShareToClipboard={handleShareToClipboard}
      handleNewGame={handleNewGame}
      solution={solution}
      guesses={guesses}
      hardMode={hardMode}
      gameMaxChallenges={gameMaxChallenges}
      onOpenChallengeCreator={() => setShowChallengeCreator(true)}
    />
  );
};
