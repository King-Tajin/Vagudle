import { Suspense } from "react";
import {
  InfoModal,
  StatsModal,
  SettingsModal,
  ChallengeAcceptModal,
  DuelModal,
  DailyModal,
  LeaderboardModal,
  AttributionModal,
  AchievementsModal,
} from "../../lazyComponents";
import type { GameStats } from "../../lib/localStorage";
import type { ChallengeConfig } from "../../lib/challenge";
import type { DuelConfig, DuelSaveStatus } from "../../lib/duel";
import type { DailyConfig, DailyStats } from "../../lib/daily";
import type { BackgroundId, BackgroundDef } from "../../lib/backgrounds";
import type { Achievement } from "../../lib/achievements";
import type { GameMode } from "../../lib/gameMode";
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
  isMobile: boolean;
  isGameWon: boolean;
  isGameLost: boolean;
  wordLength: number;
  challengeConfig: ChallengeConfig | null;
  duelConfig: DuelConfig | null;
  duelSaveStatus: DuelSaveStatus;
  dailyConfig: DailyConfig | null;
  dailyStats: DailyStats;
  dailyNumber: number;
  dailyModalMode: "loading" | "error" | "play" | "complete";
  isDailyModalOpen: boolean;
  handlePlayDaily: () => void;
  handleShareDaily: () => void;
  handleCloseDaily: () => void;
  isSignedIn: boolean;
  isLeaderboardModalOpen: boolean;
  handleOpenLeaderboard: () => void;
  handleCloseLeaderboard: () => void;
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
  isMobile,
  isGameWon,
  isGameLost,
  wordLength,
  challengeConfig,
  duelConfig,
  duelSaveStatus,
  dailyConfig,
  dailyStats,
  dailyNumber,
  dailyModalMode,
  isDailyModalOpen,
  handlePlayDaily,
  handleShareDaily,
  handleCloseDaily,
  isSignedIn,
  isLeaderboardModalOpen,
  handleOpenLeaderboard,
  handleCloseLeaderboard,
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
          cloudUpdatedAt={cloudUpdatedAt}
          isCloudUpToDate={isCloudUpToDate}
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
          isGameWon={isGameWon}
          guessCount={guesses.length}
          maxGuesses={
            dailyConfig?.hardMode
              ? HARD_MODE_MAX_CHALLENGES
              : NORMAL_MODE_MAX_CHALLENGES
          }
          isSignedIn={isSignedIn}
          onPlay={handlePlayDaily}
          onShare={handleShareDaily}
          onClose={handleCloseDaily}
          onOpenLeaderboard={handleOpenLeaderboard}
        />
        <LeaderboardModal
          isOpen={isLeaderboardModalOpen}
          handleClose={handleCloseLeaderboard}
          idToken={leaderboardIdToken}
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
