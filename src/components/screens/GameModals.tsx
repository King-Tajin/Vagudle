import { Suspense } from "react";
import {
  InfoModal,
  StatsModal,
  SettingsModal,
  ChallengeAcceptModal,
  DuelModal,
  DailyModal,
  DailyScheduleModal,
  LeaderboardModal,
  AttributionModal,
  AchievementsModal,
} from "../../lazyComponents";
import type { GameStats } from "../../lib/localStorage";
import type { ChallengeConfig } from "../../lib/challenge";
import type { DuelConfig, DuelSaveStatus } from "../../lib/duel";
import type { DailyConfig, DailyResult, DailyStats } from "../../lib/daily";
import type { BackgroundId, BackgroundDef } from "../../lib/backgrounds";
import type { Achievement } from "../../lib/achievements";
import type { GameMode } from "../../lib/gameMode";
import { getGameOutcome } from "../../lib/gameOutcome";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../../constants/settings";

type Props = {
  solution: string;
  guesses: string[];
  stats: GameStats;
  hardStats: GameStats;
  hardMode: boolean;
  extraEffects: boolean;
  setExtraEffects: (value: boolean) => void;
  cloudUpdatedAt: string | null;
  isCloudUpToDate: boolean;
  gameMode: GameMode;
  isActivityMode: boolean;
  activityAccessToken: string | null;
  isMobile: boolean;
  isGameWon: boolean;
  isGameLost: boolean;
  wordLength: number;
  challengeConfig: ChallengeConfig | null;
  duelConfig: DuelConfig | null;
  duelSaveStatus: DuelSaveStatus;
  dailyConfig: DailyConfig | null;
  dailyResult: DailyResult | null;
  dailyStats: DailyStats;
  dailyNumber: number;
  dailyModalMode: "loading" | "error" | "play" | "complete";
  isDailyModalOpen: boolean;
  handlePlayDaily: () => void;
  handleShareDaily: () => void;
  handleCloseDaily: () => void;
  handleCloseDailyModal: () => void;
  handleViewDailyGame: () => void;
  isDailyScheduleModalOpen: boolean;
  handleOpenDailySchedule: () => void;
  handleCloseDailySchedule: () => void;
  isLeaderboardModalOpen: boolean;
  handleOpenLeaderboard: () => void;
  handleCloseLeaderboard: () => void;
  handleOpenSettingsFromLeaderboard: () => void;
  handleUsernameSaved: () => Promise<void>;
  leaderboardIdToken: string | null;
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
  settingsAccountJumpKey: number;
  settingsBackgroundJumpKey: number;
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
  cloudUpdatedAt,
  isCloudUpToDate,
  gameMode,
  isActivityMode,
  activityAccessToken,
  isMobile,
  isGameWon,
  isGameLost,
  wordLength,
  challengeConfig,
  duelConfig,
  duelSaveStatus,
  dailyConfig,
  dailyResult,
  dailyStats,
  dailyNumber,
  dailyModalMode,
  isDailyModalOpen,
  handlePlayDaily,
  handleShareDaily,
  handleCloseDaily,
  handleCloseDailyModal,
  handleViewDailyGame,
  isDailyScheduleModalOpen,
  handleOpenDailySchedule,
  handleCloseDailySchedule,
  isLeaderboardModalOpen,
  handleOpenLeaderboard,
  handleCloseLeaderboard,
  handleOpenSettingsFromLeaderboard,
  handleUsernameSaved,
  leaderboardIdToken,
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
  settingsAccountJumpKey,
  settingsBackgroundJumpKey,
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
          gameOutcome={getGameOutcome(isGameWon, isGameLost)}
          handleShareToClipboard={handleShareToClipboard}
          numberOfGuessesMade={guesses.length}
          handleNewGame={() => handleNewGame()}
          hardMode={hardMode}
          challengeConfig={gameMode === "challenge" ? challengeConfig : null}
          handleReturnToNormal={
            gameMode === "challenge" ? handleReturnToNormal : undefined
          }
          extraEffects={extraEffects}
          handleDuelReturn={
            gameMode === "duel" && !isActivityMode
              ? handleReturnToNormal
              : undefined
          }
          isActivityMode={isActivityMode}
          duelConfig={gameMode === "duel" ? duelConfig : null}
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
          settings={{
            showGrayCount,
            hardMode,
            autoGray,
            autoGreen,
            extraEffects,
            backgroundId,
          }}
          settingsHandlers={{
            setShowGrayCount,
            setHardMode: handleHardModeChange,
            setAutoGray: handleSetAutoGray,
            setAutoGreen,
            setExtraEffects,
            setBackgroundId,
          }}
          unlockedAchievementIds={unlockedIds}
          isMobile={isMobile}
          challengeConfig={
            gameMode === "duel"
              ? duelConfig
              : gameMode === "challenge"
                ? challengeConfig
                : gameMode === "daily" && dailyConfig
                  ? {
                      id: "daily",
                      word: dailyConfig.word,
                      length: dailyConfig.wordLength,
                      dict: dailyConfig.hardMode ? "hard" : "normal",
                      guesses: dailyConfig.hardMode
                        ? HARD_MODE_MAX_CHALLENGES
                        : NORMAL_MODE_MAX_CHALLENGES,
                    }
                  : null
          }
          isActivityMode={isActivityMode}
          activityAccessToken={activityAccessToken}
          cloudUpdatedAt={cloudUpdatedAt}
          isCloudUpToDate={isCloudUpToDate}
          jumpToAccountKey={settingsAccountJumpKey}
          jumpToBackgroundKey={settingsBackgroundJumpKey}
        />
        {gameMode === "challenge" && challengeConfig && (
          <ChallengeAcceptModal
            isOpen={isChallengeModalOpen}
            onPlay={handlePlayChallenge}
            config={challengeConfig}
          />
        )}
        {gameMode === "duel" && duelConfig && (
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
        <DailyModal
          isOpen={isDailyModalOpen}
          mode={dailyModalMode}
          config={dailyConfig}
          dailyNumber={dailyNumber}
          dailyStats={dailyStats}
          result={{
            won: dailyResult?.won ?? isGameWon,
            guessCount: dailyResult?.guessCount ?? guesses.length,
            maxGuesses:
              dailyResult?.maxGuesses ??
              (dailyConfig?.hardMode
                ? HARD_MODE_MAX_CHALLENGES
                : NORMAL_MODE_MAX_CHALLENGES),
          }}
          origin={
            gameMode === "daily"
              ? { type: "daily" }
              : { type: "normal", canViewGame: !!dailyResult?.guesses }
          }
          onPlay={handlePlayDaily}
          onShare={handleShareDaily}
          onClose={handleCloseDaily}
          onCloseModal={handleCloseDailyModal}
          onOpenLeaderboard={handleOpenLeaderboard}
          onViewGame={handleViewDailyGame}
          onOpenSchedule={handleOpenDailySchedule}
        />
        <DailyScheduleModal
          isOpen={isDailyScheduleModalOpen}
          handleClose={handleCloseDailySchedule}
        />
        <LeaderboardModal
          isOpen={isLeaderboardModalOpen}
          handleClose={handleCloseLeaderboard}
          idToken={leaderboardIdToken}
          onOpenSettings={handleOpenSettingsFromLeaderboard}
          onUsernameSaved={handleUsernameSaved}
          isActivityMode={isActivityMode}
        />
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
