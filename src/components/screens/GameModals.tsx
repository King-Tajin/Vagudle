import { Suspense } from "react";
import {
  InfoModal,
  StatsModal,
  SettingsModal,
  ChallengeAcceptModal,
  DuelModal,
  AttributionModal,
  AchievementsModal,
} from "../../lazyComponents";
import type { GameStats } from "../../lib/localStorage";
import type { ChallengeConfig } from "../../lib/challenge";
import type { DuelConfig, DuelSaveStatus } from "../../lib/duel";
import type { BackgroundId, BackgroundDef } from "../../lib/backgrounds";
import type { Achievement } from "../../lib/achievements";

type Props = {
  solution: string;
  guesses: string[];
  stats: GameStats;
  hardStats: GameStats;
  hardMode: boolean;
  extraEffects: boolean;
  setExtraEffects: (value: boolean) => void;
  isDuelMode: boolean;
  isChallengeMode: boolean;
  isActivityMode: boolean;
  isMobile: boolean;
  isGameWon: boolean;
  isGameLost: boolean;
  wordLength: number;
  challengeConfig: ChallengeConfig | null;
  duelConfig: DuelConfig | null;
  duelSaveStatus: DuelSaveStatus;
  showGrayCount: boolean;
  setShowGrayCount: (value: boolean) => void;
  autoGray: boolean;
  handleSetAutoGray: (value: boolean) => void;
  autoGreen: boolean;
  setAutoGreen: (value: boolean) => void;
  backgroundId: BackgroundId;
  setBackgroundId: (value: BackgroundId) => void;
  unlockedIds: string[];
  newlyUnlockedAchievements: Achievement[];
  onAchievementsViewed: () => void;
  currentBackground: BackgroundDef | undefined;
  hiddenAttributionIds: BackgroundId[];
  handleAttributionHideForeverChange: (hidden: boolean) => void;
  handleRestoreHiddenAttributions: () => void;
  uniqueWordCount: number;
  currentWinStreak: number;
  totalWins: number;
  handleNewGame: (length?: number) => void;
  handleReturnToNormal: () => void;
  handleWordLengthChange: (length: number) => void;
  handleHardModeChange: (value: boolean) => void;
  handleShareToClipboard: () => void;
  isInfoModalOpen: boolean;
  handleCloseInfo: () => void;
  isStatsModalOpen: boolean;
  handleCloseStats: () => void;
  isSettingsModalOpen: boolean;
  handleCloseSettings: () => void;
  isChallengeModalOpen: boolean;
  handlePlayChallenge: () => void;
  isDuelModalOpen: boolean;
  handlePlayDuel: () => void;
  isAttributionModalOpen: boolean;
  handleCloseAttribution: () => void;
  isAchievementsModalOpen: boolean;
  handleCloseAchievements: () => void;
};

export const GameModals = ({
  solution,
  guesses,
  stats,
  hardStats,
  hardMode,
  extraEffects,
  setExtraEffects,
  isDuelMode,
  isChallengeMode,
  isActivityMode,
  isMobile,
  isGameWon,
  isGameLost,
  wordLength,
  challengeConfig,
  duelConfig,
  duelSaveStatus,
  showGrayCount,
  setShowGrayCount,
  autoGray,
  handleSetAutoGray,
  autoGreen,
  setAutoGreen,
  backgroundId,
  setBackgroundId,
  unlockedIds,
  newlyUnlockedAchievements,
  onAchievementsViewed,
  currentBackground,
  hiddenAttributionIds,
  handleAttributionHideForeverChange,
  handleRestoreHiddenAttributions,
  uniqueWordCount,
  currentWinStreak,
  totalWins,
  handleNewGame,
  handleReturnToNormal,
  handleWordLengthChange,
  handleHardModeChange,
  handleShareToClipboard,
  isInfoModalOpen,
  handleCloseInfo,
  isStatsModalOpen,
  handleCloseStats,
  isSettingsModalOpen,
  handleCloseSettings,
  isChallengeModalOpen,
  handlePlayChallenge,
  isDuelModalOpen,
  handlePlayDuel,
  isAttributionModalOpen,
  handleCloseAttribution,
  isAchievementsModalOpen,
  handleCloseAchievements,
}: Props) => {
  return (
    <>
      <Suspense fallback={null}>
        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={handleCloseInfo}
          hasHiddenAttributions={hiddenAttributionIds.length > 0}
          onRestoreHiddenAttributions={handleRestoreHiddenAttributions}
        />
      </Suspense>

      <Suspense fallback={null}>
        <StatsModal
          isOpen={isStatsModalOpen}
          handleClose={handleCloseStats}
          solution={solution}
          guesses={guesses}
          gameStats={stats}
          hardGameStats={hardStats}
          isGameLost={isGameLost}
          isGameWon={isGameWon}
          handleShareToClipboard={handleShareToClipboard}
          numberOfGuessesMade={guesses.length}
          handleNewGame={() => handleNewGame()}
          hardMode={hardMode}
          challengeConfig={isChallengeMode ? challengeConfig : null}
          handleReturnToNormal={
            isChallengeMode ? handleReturnToNormal : undefined
          }
          extraEffects={extraEffects}
          isDuelMode={isDuelMode}
          handleDuelReturn={
            isDuelMode && !isActivityMode ? handleReturnToNormal : undefined
          }
          isActivityMode={isActivityMode}
          duelConfig={isDuelMode ? duelConfig : null}
          newlyUnlockedAchievements={newlyUnlockedAchievements}
          onAchievementsViewed={onAchievementsViewed}
          setBackgroundId={setBackgroundId}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          handleClose={handleCloseSettings}
          wordLength={wordLength}
          hasStarted={guesses.length > 0}
          onWordLengthChange={handleWordLengthChange}
          showGrayCount={showGrayCount}
          setShowGrayCount={setShowGrayCount}
          hardMode={hardMode}
          setHardMode={handleHardModeChange}
          autoGray={autoGray}
          setAutoGray={handleSetAutoGray}
          autoGreen={autoGreen}
          setAutoGreen={setAutoGreen}
          extraEffects={extraEffects}
          setExtraEffects={setExtraEffects}
          backgroundId={backgroundId}
          setBackgroundId={setBackgroundId}
          unlockedAchievementIds={unlockedIds}
          isMobile={isMobile}
          challengeConfig={
            isDuelMode ? duelConfig : isChallengeMode ? challengeConfig : null
          }
          isActivityMode={isActivityMode}
        />
        {isChallengeMode && challengeConfig && (
          <ChallengeAcceptModal
            isOpen={isChallengeModalOpen}
            onPlay={handlePlayChallenge}
            config={challengeConfig}
          />
        )}
        {isDuelMode && duelConfig && (
          <DuelModal
            isOpen={isDuelModalOpen}
            mode={isGameWon || isGameLost ? "complete" : "accept"}
            config={duelConfig}
            onPlay={handlePlayDuel}
            onReturn={handleReturnToNormal}
            saveStatus={duelSaveStatus}
            isActivityMode={isActivityMode}
          />
        )}
        {currentBackground?.attribution && (
          <AttributionModal
            isOpen={isAttributionModalOpen}
            handleClose={handleCloseAttribution}
            attribution={currentBackground.attribution}
            isHidden={hiddenAttributionIds.includes(backgroundId)}
            onHideForeverChange={handleAttributionHideForeverChange}
          />
        )}
      </Suspense>

      <Suspense fallback={null}>
        <AchievementsModal
          isOpen={isAchievementsModalOpen}
          handleClose={handleCloseAchievements}
          unlockedIds={unlockedIds}
          totalWins={totalWins}
          uniqueWordCount={uniqueWordCount}
          currentWinStreak={currentWinStreak}
        />
      </Suspense>
    </>
  );
};
