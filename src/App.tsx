import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useReducer,
  useCallback,
  Suspense,
} from "react";
import { m } from "framer-motion";

import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { AlertContainer } from "./components/Alert";
import { Navbar } from "./components/layout/Navbar";
import { BackgroundStage } from "./components/backgrounds/BackgroundStage";
import { GameBanner } from "./components/layout/GameBanner";
import { DisclaimerBanner } from "./components/layout/DisclaimerBanner";
import { AttributionButton } from "./components/layout/AttributionButton";
import { GameModals } from "./components/screens/GameModals";
import { AchievementTrayToggle } from "./components/overlays/AchievementTrayToggle";
import { CloudSaveConflictOverlay } from "./components/overlays/CloudSaveConflictOverlay";
import { WinCelebrationOverlay } from "./components/overlays/WinCelebrationOverlay";
import { AchievementRevealOverlay } from "./components/overlays/AchievementRevealOverlay";
import { useAchievements } from "./hooks/useAchievements";
import {
  BACKGROUNDS,
  type BackgroundId,
  loadBackgroundId,
} from "./lib/backgrounds";
import type { Achievement } from "./lib/achievements";
import type { CharStatus } from "./lib/statuses";

import {
  MalformedChallengeScreen,
  MalformedDuelScreen,
  ExpiredDuelScreen,
  ActivityNotFoundScreen,
  ActivityWrongPlayerScreen,
  ActivityServerErrorScreen,
  ActivityAccountChoiceScreen,
  ActivityAlreadyPlayedScreen,
} from "./lazyComponents";

import { LoadingScreen } from "./components/screens/GameScreens";

import { useAlert } from "./context/alert-context";
import { useIsMobile } from "./hooks/useIsMobile";
import { usePageChrome } from "./hooks/usePageChrome";
import { useDiscourageInAppBrowser } from "./hooks/useDiscourageInAppBrowser";
import { useTilePainting } from "./hooks/useTilePainting";
import { useDuelResult } from "./hooks/useDuelResult";
import { useDailyActivityResult } from "./hooks/useDailyActivityResult";
import { useDailyActivityGuessSync } from "./hooks/useDailyActivityGuessSync";
import { useGameOutcome } from "./hooks/useGameOutcome";
import { useGameInitialization } from "./hooks/useGameInitialization";
import { useGameFlow } from "./hooks/useGameFlow";
import { useGuessInput } from "./hooks/useGuessInput";
import { useSaveGameState } from "./hooks/useSaveGameState";
import { useCrossTabSync } from "./hooks/useCrossTabSync";
import { useBackgroundAttribution } from "./hooks/useBackgroundAttribution";
import { useDailyMode } from "./hooks/useDailyMode";
import { useLeaderboardModal } from "./hooks/useLeaderboardModal";
import {
  completeEmailLinkSignIn,
  completeDiscordSignIn,
  useCloudAuth,
} from "./hooks/useCloudAuth";
import { useCloudSync } from "./hooks/useCloudSync";

import { getRandomWord } from "./lib/words";
import { getStatusesFromCellColors } from "./lib/statuses";
import { computeFullyGrayLetters } from "./lib/rowAnalysis";
import {
  loadGameStateFromLocalStorage,
  loadSettingsFromLocalStorage,
} from "./lib/localStorage";
import { loadStats } from "./lib/stats";
import { isDiscordActivity } from "./lib/discord";
import { pruneOldDailyEntries, DAILY_PATH } from "./lib/daily";
import type { ChallengeConfig } from "./lib/challenge";
import type { DuelConfig } from "./lib/duel";
import type { GameMode } from "./lib/gameMode";
import {
  gameRoundReducer,
  type GameRoundState,
} from "./state/gameRoundReducer";

import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "./constants/settings";
import { GAME_COPIED_MESSAGE } from "./constants/strings";

const challengeParam = new URLSearchParams(window.location.search).get(
  "challenge"
);
const duelParam = new URLSearchParams(window.location.search).get("duel");
const isDailyRoute = window.location.pathname === DAILY_PATH;

function App() {
  const {
    showError: showErrorAlert,
    showSuccess: showSuccessAlert,
    dismiss: dismissAlert,
    cancel: cancelAlert,
  } = useAlert();

  const isMobile = useIsMobile();
  const isMobileRef = useRef(isMobile);
  useEffect(() => {
    isMobileRef.current = isMobile;
  }, [isMobile]);

  const {
    pendingCloudSave,
    cloudUpdatedAt,
    isUpToDate,
    resolvePendingCloudSave,
  } = useCloudSync(isMobile);
  const { user } = useCloudAuth();

  useEffect(() => {
    void completeEmailLinkSignIn();
    void completeDiscordSignIn();
    pruneOldDailyEntries();
  }, []);

  const [isLoading, setIsLoading] = useState(true);

  const [{ savedGameState, savedSettings }] = useState(() => ({
    savedGameState: loadGameStateFromLocalStorage(),
    savedSettings: loadSettingsFromLocalStorage(),
  }));

  const [gameRoundState, dispatchGameRound] = useReducer(gameRoundReducer, {
    solution: savedGameState?.solution ?? "",
    guesses: savedGameState?.guesses ?? [],
    cellColors:
      (savedGameState?.cellColors as { [key: string]: CharStatus }) ?? {},
    currentGuess: "",
    currentRowClass: "",
    isGameWon: false,
    isGameLost: false,
    isRevealing: false,
    isCelebrating: false,
  } satisfies GameRoundState);
  const {
    solution,
    guesses,
    cellColors,
    currentGuess,
    currentRowClass,
    isGameWon,
    isGameLost,
    isRevealing,
    isCelebrating,
  } = gameRoundState;
  const setSolution = useCallback(
    (value: React.SetStateAction<string>) =>
      dispatchGameRound({ field: "solution", value }),
    []
  );
  const setGuesses = useCallback(
    (value: React.SetStateAction<string[]>) =>
      dispatchGameRound({ field: "guesses", value }),
    []
  );
  const setCellColors = useCallback(
    (value: React.SetStateAction<{ [key: string]: CharStatus }>) =>
      dispatchGameRound({ field: "cellColors", value }),
    []
  );
  const setCurrentGuess = useCallback(
    (value: React.SetStateAction<string>) =>
      dispatchGameRound({ field: "currentGuess", value }),
    []
  );
  const setCurrentRowClass = useCallback(
    (value: React.SetStateAction<string>) =>
      dispatchGameRound({ field: "currentRowClass", value }),
    []
  );
  const setIsGameWon = useCallback(
    (value: React.SetStateAction<boolean>) =>
      dispatchGameRound({ field: "isGameWon", value }),
    []
  );
  const setIsGameLost = useCallback(
    (value: React.SetStateAction<boolean>) =>
      dispatchGameRound({ field: "isGameLost", value }),
    []
  );
  const setIsRevealing = useCallback(
    (value: React.SetStateAction<boolean>) =>
      dispatchGameRound({ field: "isRevealing", value }),
    []
  );
  const setIsCelebrating = useCallback(
    (value: React.SetStateAction<boolean>) =>
      dispatchGameRound({ field: "isCelebrating", value }),
    []
  );
  const [isRevealingAchievement, setIsRevealingAchievement] = useState(false);
  const [challengeConfig, setChallengeConfig] =
    useState<ChallengeConfig | null>(null);
  const [isMalformedChallenge, setIsMalformedChallenge] = useState(false);
  const [duelConfig, setDuelConfig] = useState<DuelConfig | null>(null);
  const [duelToken, setDuelToken] = useState<string | null>(null);
  const [activityAccessToken, setActivityAccessToken] = useState<string | null>(
    null
  );
  const [isMalformedDuel, setIsMalformedDuel] = useState(false);
  const [isDuelExpired, setIsDuelExpired] = useState(false);
  const [isActivityNotFound] = useState(false);
  const [isActivityWrongPlayer, setIsActivityWrongPlayer] = useState(false);
  const [isActivityServerError, setIsActivityServerError] = useState(false);
  const [isActivityAccountChoicePending, setIsActivityAccountChoicePending] =
    useState(false);
  const [isActivityAlreadyPlayed, setIsActivityAlreadyPlayed] = useState(false);
  const [activityAlreadyPlayedPlatform, setActivityAlreadyPlayedPlatform] =
    useState<string | undefined>(undefined);
  const [isDuelModalOpen, setIsDuelModalOpen] = useState(false);
  const [isDailyActive, setIsDailyActive] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [settingsAccountJumpKey, setSettingsAccountJumpKey] = useState(0);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isAttributionModalOpen, setIsAttributionModalOpen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(true);
  const [stats, setStats] = useState(() => loadStats(false));
  const [hardStats, setHardStats] = useState(() => loadStats(true));
  const currentWinStreak = Math.max(
    stats.currentStreak,
    hardStats.currentStreak
  );
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<
    Achievement[]
  >([]);
  const [wordLength, setWordLength] = useState(savedSettings.wordLength);
  const [hardMode, setHardMode] = useState(savedSettings.hardMode);
  const [showGrayCount, setShowGrayCount] = useState(
    savedSettings.showGrayCount
  );
  const [autoGray, setAutoGray] = useState(savedSettings.autoGray ?? false);
  const [autoGreen, setAutoGreen] = useState(savedSettings.autoGreen ?? false);
  const [extraEffects, setExtraEffects] = useState(
    savedSettings.extraEffects ?? true
  );
  const [backgroundId, setBackgroundId] = useState<BackgroundId>(() =>
    loadBackgroundId(window.innerWidth < 640)
  );
  const autoGrayLetters = useMemo(
    () =>
      autoGray ? computeFullyGrayLetters(solution, guesses) : new Set<string>(),
    [autoGray, solution, guesses]
  );
  const {
    hiddenAttributionIds,
    setHiddenAttributionIds,
    currentBackground,
    showAttributionButton,
    handleAttributionHideForeverChange,
    handleRestoreHiddenAttributions,
  } = useBackgroundAttribution(backgroundId);
  const {
    unlockedIds,
    uniqueWordCount,
    recordWin,
    recordGuess,
    resetWinRecord,
  } = useAchievements();
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredGameRef = useRef(false);
  const duelSubmittedRef = useRef(false);
  const dailyActivitySubmittedRef = useRef(false);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const achievementCheckedRef = useRef(false);
  const achievementRevealPendingRef = useRef(false);
  const hasAutoClosedTrayRef = useRef(false);
  const extraEffectsRef = useRef(extraEffects);
  useEffect(() => {
    extraEffectsRef.current = extraEffects;
  }, [extraEffects]);
  const startNewGame = (newSolution: string) => {
    achievementCheckedRef.current = false;
    resetWinRecord();
    setNewlyUnlockedAchievements([]);
    hasAutoClosedTrayRef.current = false;
    setIsTrayOpen(true);
    setSolution(newSolution);
  };
  const announceAchievement = (achievement: Achievement) => {
    const bg = BACKGROUNDS.find(
      (b) => b.requiresAchievementId === achievement.id
    );
    showSuccessAlert(
      `🏆 Achievement Unlocked: ${achievement.title}` +
        (bg ? ` — ${bg.desktopLabel} background unlocked!` : ""),
      { durationMs: 4000 }
    );
  };
  const gameMode: GameMode =
    duelConfig !== null
      ? "duel"
      : challengeConfig !== null
        ? "challenge"
        : isDailyActive
          ? "daily"
          : "normal";
  const isChallengeMode = gameMode === "challenge";
  const isDuelMode = gameMode === "duel";
  const isDailyMode = gameMode === "daily";
  useEffect(() => {
    if (
      !isGameWon ||
      isDuelMode ||
      isChallengeMode ||
      isDailyMode ||
      achievementCheckedRef.current
    )
      return;
    achievementCheckedRef.current = true;
    const newly = recordWin({
      wordLength: solution.length,
      guessCount: guesses.length,
      hardMode,
      guesses,
      solution,
    });
    if (newly.length > 0) {
      // Depends on the side-effecting recordWin() result, so it can't be derived during render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewlyUnlockedAchievements((prev) => [...prev, ...newly]);
      achievementRevealPendingRef.current = true;
    }
  }, [
    isGameWon,
    isDuelMode,
    isChallengeMode,
    isDailyMode,
    solution,
    guesses,
    hardMode,
    recordWin,
  ]);
  const { onCellPaint, onRowReset, onFullReset, clearAutoGray } =
    useTilePainting({
      guesses,
      solution,
      autoGray,
      autoGreen,
      cellColors,
      setCellColors,
    });
  const {
    dailyConfig,
    setDailyConfig,
    dailyResult,
    setDailyResult,
    dailyStats,
    setDailyStats,
    isDailyModalOpen,
    setIsDailyModalOpen,
    dailyModalMode,
    setDailyModalMode,
    isDailyScheduleModalOpen,
    dailyNumber,
    dailyUsernameWarning,
    submitDailyToLeaderboard,
    handleOpenDaily,
    handlePlayDaily,
    handleShareDaily,
    handleCloseDaily,
    handleCloseDailyModal,
    handleOpenDailySchedule,
    handleCloseDailySchedule,
    handleViewDailyGame,
    handleUsernameSaved,
    handleDailyComplete,
  } = useDailyMode({
    user,
    setIsDailyActive,
    isDailyMode,
    guesses,
    isGameLost,
    restoredGameRef,
    dismissAlert,
    showSuccessAlert,
    setSolution,
    setGuesses,
    setCellColors,
    setCurrentGuess,
    setCurrentRowClass,
    setIsGameWon,
    setIsGameLost,
  });
  const openPostGameModal = () => {
    if (isDuelMode) setIsDuelModalOpen(true);
    else if (isDailyMode) setIsDailyModalOpen(true);
    else setIsStatsModalOpen(true);
  };
  const handleCelebrationDone = () => {
    setIsCelebrating(false);
    if (achievementRevealPendingRef.current) {
      achievementRevealPendingRef.current = false;
      setIsRevealingAchievement(true);
    } else {
      openPostGameModal();
    }
  };
  const handleAchievementRevealDone = () => {
    setIsRevealingAchievement(false);
    openPostGameModal();
  };
  const maxChallenges =
    duelConfig?.guesses ??
    challengeConfig?.guesses ??
    (isDailyMode && dailyConfig
      ? dailyConfig.hardMode
        ? HARD_MODE_MAX_CHALLENGES
        : NORMAL_MODE_MAX_CHALLENGES
      : hardMode
        ? HARD_MODE_MAX_CHALLENGES
        : NORMAL_MODE_MAX_CHALLENGES);
  const userStatuses = getStatusesFromCellColors(guesses, cellColors);
  const handleSetAutoGray = (value: boolean) => {
    setAutoGray(value);
    if (!value) clearAutoGray();
  };
  useDailyActivityResult({
    isDailyActivityMode: isDiscordActivity && isDailyMode,
    activityAccessToken,
    isGameWon,
    isGameLost,
    guesses,
    submittedRef: dailyActivitySubmittedRef,
  });
  useDailyActivityGuessSync({
    isDailyActivityMode: isDiscordActivity && isDailyMode,
    activityAccessToken,
    guesses,
  });
  const duelSaveStatus = useDuelResult({
    isDuelMode,
    duelToken,
    activityAccessToken,
    activityDuelId: duelConfig?.id ?? null,
    isGameWon,
    isGameLost,
    guessCount: guesses.length,
    submittedRef: duelSubmittedRef,
  });
  useGameOutcome({
    isGameWon,
    isGameLost,
    solution,
    isDuelMode,
    isChallengeMode,
    isDailyMode,
    restoredRef: restoredGameRef,
    extraEffectsRef,
    achievementRevealPendingRef,
    showSuccessAlert,
    cancelAlert,
    setIsCelebrating,
    setIsRevealingAchievement,
    setIsDuelModalOpen,
    setIsStatsModalOpen,
    setIsDailyModalOpen,
  });
  const {
    handleNewGame,
    handleReturnToNormal,
    handleNewGameWithFail,
    handleWordLengthChange,
    recordStats,
    hasActiveGame,
  } = useGameFlow({
    wordLength,
    hardMode,
    guesses,
    isGameWon,
    isGameLost,
    isDuelMode,
    isChallengeMode,
    isDailyMode,
    maxChallenges,
    revealTimerRef,
    setWordLength,
    setSolution: startNewGame,
    setGuesses,
    setCurrentGuess,
    setCurrentRowClass,
    setCellColors,
    setIsGameWon,
    setIsGameLost,
    setIsStatsModalOpen,
    setStats,
    setHardStats,
    dismissAlert,
  });
  const {
    isLeaderboardModalOpen,
    leaderboardIdToken,
    handleOpenLeaderboard,
    handleCloseLeaderboard,
    handleOpenSettingsFromLeaderboard,
  } = useLeaderboardModal({
    isDailyMode,
    setIsDailyModalOpen,
    setIsSettingsModalOpen,
    setSettingsAccountJumpKey,
  });
  const { onChar, onDelete, onEnter } = useGuessInput({
    currentGuess,
    solution,
    guesses,
    maxChallenges,
    isGameWon,
    isGameLost,
    isChallengeMode,
    isDuelMode,
    isDailyMode,
    cellColors,
    revealTimerRef,
    setCurrentGuess,
    setCurrentRowClass,
    setIsRevealing,
    setGuesses,
    setIsGameWon,
    setIsGameLost,
    setCellColors,
    showErrorAlert,
    recordStats,
    isMobileRef,
    hasAutoClosedTrayRef,
    setIsTrayOpen,
    onGuessSubmit: (word) => {
      if (isChallengeMode || isDuelMode || isDailyMode) return;
      const newly = recordGuess(word, solution, guesses);
      if (newly.length > 0) {
        setNewlyUnlockedAchievements((prev) => [...prev, ...newly]);
        achievementRevealPendingRef.current = true;
        newly.forEach(announceAchievement);
      }
    },
    onDailyComplete: handleDailyComplete,
  });
  const { resolveDailyActivityAccount } = useGameInitialization({
    challengeParam,
    duelParam,
    isDailyRoute,
    restoredGameRef,
    duelSubmittedRef,
    setIsLoading,
    setIsMalformedChallenge,
    setIsMalformedDuel,
    setIsDuelExpired,
    setIsActivityWrongPlayer,
    setIsActivityServerError,
    setIsActivityAccountChoicePending,
    setIsActivityAlreadyPlayed,
    setActivityAlreadyPlayedPlatform,
    setChallengeConfig,
    setDuelConfig,
    setDuelToken,
    setActivityAccessToken,
    setSolution,
    setGuesses,
    setCellColors,
    setIsGameWon,
    setIsGameLost,
    setIsChallengeModalOpen,
    setIsDuelModalOpen,
    setIsInfoModalOpen,
    setIsStatsModalOpen,
    setIsDailyActive,
    setDailyConfig,
    setDailyResult,
    setDailyStats,
    setIsDailyModalOpen,
    setDailyModalMode,
    onDailyRestoredComplete: (date, won) => {
      void submitDailyToLeaderboard(date, won);
    },
    showErrorAlert,
  });
  useSaveGameState({
    isLoading,
    solution,
    guesses,
    cellColors,
    autoGrayLetters,
    hardMode,
    wordLength,
    showGrayCount,
    autoGray,
    autoGreen,
    extraEffects,
    isDuelMode,
    duelConfig,
    isChallengeMode,
    challengeConfig,
    isDailyMode,
    dailyConfig,
  });
  useCrossTabSync({
    isLoading,
    isMobile,
    isDuelMode,
    isChallengeMode,
    isDailyMode,
    duelConfig,
    challengeConfig,
    solution,
    hardMode,
    restoredGameRef,
    achievementCheckedRef,
    duelSubmittedRef,
    onNewGameSynced: startNewGame,
    setSolution,
    setGuesses,
    setCellColors,
    setIsGameWon,
    setIsGameLost,
    setCurrentGuess,
    setCurrentRowClass,
    setIsRevealing,
    setWordLength,
    setHardMode,
    setShowGrayCount,
    setAutoGray,
    setAutoGreen,
    setExtraEffects,
    setStats,
    setHardStats,
    setDailyStats,
    setBackgroundId,
    setHiddenAttributionIds,
  });
  usePageChrome({ isDuelMode, isChallengeMode, isDailyMode });
  useDiscourageInAppBrowser({ showErrorAlert });
  if (isLoading) return <LoadingScreen />;
  const screenFallback = (
    <div className="h-screen" style={{ background: "#0A0A0A" }} />
  );
  if (isActivityNotFound)
    return (
      <Suspense fallback={screenFallback}>
        <ActivityNotFoundScreen />
      </Suspense>
    );
  if (isActivityWrongPlayer)
    return (
      <Suspense fallback={screenFallback}>
        <ActivityWrongPlayerScreen />
      </Suspense>
    );
  if (isActivityServerError)
    return (
      <Suspense fallback={screenFallback}>
        <ActivityServerErrorScreen />
      </Suspense>
    );
  if (isActivityAccountChoicePending && activityAccessToken)
    return (
      <Suspense fallback={screenFallback}>
        <ActivityAccountChoiceScreen
          accessToken={activityAccessToken}
          onResolved={resolveDailyActivityAccount}
        />
      </Suspense>
    );
  if (isActivityAlreadyPlayed)
    return (
      <Suspense fallback={screenFallback}>
        <ActivityAlreadyPlayedScreen platform={activityAlreadyPlayedPlatform} />
      </Suspense>
    );
  if (isMalformedChallenge)
    return (
      <Suspense fallback={screenFallback}>
        <MalformedChallengeScreen handleReturnToNormal={handleReturnToNormal} />
      </Suspense>
    );
  if (isMalformedDuel)
    return (
      <Suspense fallback={screenFallback}>
        <MalformedDuelScreen handleReturnToNormal={handleReturnToNormal} />
      </Suspense>
    );
  if (isDuelExpired)
    return (
      <Suspense fallback={screenFallback}>
        <ExpiredDuelScreen handleReturnToNormal={handleReturnToNormal} />
      </Suspense>
    );

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      <DisclaimerBanner />
      <BackgroundStage
        backgroundId={backgroundId}
        isMobile={isMobile}
        extraEffects={extraEffects}
        keyboardRef={keyboardRef}
        guessesUsed={guesses.length}
        maxChallenges={maxChallenges}
        currentWinStreak={currentWinStreak}
        guesses={guesses}
      />
      {showAttributionButton && (
        <AttributionButton
          onClick={() => setIsAttributionModalOpen(true)}
          keyboardRef={keyboardRef}
          isMobile={isMobile}
        />
      )}
      {!isChallengeMode && !isDuelMode && !isDailyMode && (
        <AchievementTrayToggle
          isTrayOpen={isTrayOpen}
          onToggleTray={() => setIsTrayOpen((prev) => !prev)}
          onOpenAchievements={() => setIsAchievementsModalOpen(true)}
        />
      )}
      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        handleNewGame={handleNewGameWithFail}
        hasActiveGame={hasActiveGame}
        gameMode={gameMode}
        isInfoModalOpen={isInfoModalOpen}
        isActivityMode={isDiscordActivity}
        onOpenDaily={handleOpenDaily}
      />
      <div className="relative pt-2 px-1 pb-44 md:max-w-7xl w-full mx-auto sm:px-6 lg:px-8 flex flex-col grow">
        <div className="pb-6 grow">
          <m.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-pixel text-center text-4xl text-crown-gold crown-glow tracking-widest mb-4"
          >
            VAGUDLE
          </m.p>
          <GameBanner
            gameMode={gameMode}
            challengeConfig={challengeConfig}
            duelConfig={duelConfig}
            dailyConfig={dailyConfig}
            dailyNumber={dailyNumber}
            usernameWarning={dailyUsernameWarning}
          />
          <Grid
            solution={solution}
            guesses={guesses}
            currentGuess={currentGuess}
            isRevealing={isRevealing}
            currentRowClassName={currentRowClass}
            showGrayCount={showGrayCount}
            maxChallenges={maxChallenges}
            cellColors={cellColors}
            onCellPaint={onCellPaint}
            onRowReset={onRowReset}
            onFullReset={onFullReset}
            autoGray={autoGray}
          />
        </div>
        <Keyboard
          onChar={onChar}
          onDelete={onDelete}
          onEnter={onEnter}
          solution={solution}
          userStatuses={userStatuses}
          isRevealing={isRevealing}
          containerRef={keyboardRef}
        />
        <GameModals
          solution={solution}
          guesses={guesses}
          stats={stats}
          hardStats={hardStats}
          hardMode={hardMode}
          extraEffects={extraEffects}
          setExtraEffects={setExtraEffects}
          cloudUpdatedAt={cloudUpdatedAt}
          isCloudUpToDate={isUpToDate}
          gameMode={gameMode}
          isActivityMode={isDiscordActivity}
          isMobile={isMobile}
          isGameWon={isGameWon}
          isGameLost={isGameLost}
          wordLength={wordLength}
          challengeConfig={challengeConfig}
          duelConfig={duelConfig}
          duelSaveStatus={duelSaveStatus}
          dailyConfig={dailyConfig}
          dailyResult={dailyResult}
          dailyStats={dailyStats}
          dailyNumber={dailyNumber}
          dailyModalMode={dailyModalMode}
          isDailyModalOpen={isDailyModalOpen}
          handlePlayDaily={handlePlayDaily}
          handleShareDaily={handleShareDaily}
          handleCloseDaily={handleCloseDaily}
          handleCloseDailyModal={handleCloseDailyModal}
          handleViewDailyGame={handleViewDailyGame}
          isDailyScheduleModalOpen={isDailyScheduleModalOpen}
          handleOpenDailySchedule={handleOpenDailySchedule}
          handleCloseDailySchedule={handleCloseDailySchedule}
          isLeaderboardModalOpen={isLeaderboardModalOpen}
          handleOpenLeaderboard={handleOpenLeaderboard}
          handleCloseLeaderboard={handleCloseLeaderboard}
          handleOpenSettingsFromLeaderboard={handleOpenSettingsFromLeaderboard}
          handleUsernameSaved={handleUsernameSaved}
          leaderboardIdToken={leaderboardIdToken}
          showGrayCount={showGrayCount}
          setShowGrayCount={setShowGrayCount}
          autoGray={autoGray}
          handleSetAutoGray={handleSetAutoGray}
          autoGreen={autoGreen}
          setAutoGreen={setAutoGreen}
          backgroundId={backgroundId}
          setBackgroundId={setBackgroundId}
          unlockedIds={unlockedIds}
          newlyUnlockedAchievements={newlyUnlockedAchievements}
          onAchievementsViewed={() => setNewlyUnlockedAchievements([])}
          currentBackground={currentBackground}
          hiddenAttributionIds={hiddenAttributionIds}
          handleAttributionHideForeverChange={
            handleAttributionHideForeverChange
          }
          handleRestoreHiddenAttributions={handleRestoreHiddenAttributions}
          uniqueWordCount={uniqueWordCount}
          currentWinStreak={currentWinStreak}
          totalWins={
            stats.totalGames -
            stats.gamesFailed +
            (hardStats.totalGames - hardStats.gamesFailed)
          }
          handleNewGame={handleNewGame}
          handleReturnToNormal={handleReturnToNormal}
          handleWordLengthChange={handleWordLengthChange}
          handleHardModeChange={(value: boolean) => {
            setHardMode(value);
            if (guesses.length === 0)
              startNewGame(getRandomWord(wordLength, value));
          }}
          handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
          isInfoModalOpen={isInfoModalOpen}
          handleCloseInfo={() => setIsInfoModalOpen(false)}
          isStatsModalOpen={isStatsModalOpen}
          handleCloseStats={() => setIsStatsModalOpen(false)}
          isSettingsModalOpen={isSettingsModalOpen}
          handleCloseSettings={() => {
            setIsSettingsModalOpen(false);
            if (isDailyMode) setIsDailyModalOpen(true);
          }}
          settingsAccountJumpKey={settingsAccountJumpKey}
          isChallengeModalOpen={isChallengeModalOpen}
          handlePlayChallenge={() => setIsChallengeModalOpen(false)}
          isDuelModalOpen={isDuelModalOpen}
          handlePlayDuel={() => setIsDuelModalOpen(false)}
          isAttributionModalOpen={isAttributionModalOpen}
          handleCloseAttribution={() => setIsAttributionModalOpen(false)}
          isAchievementsModalOpen={isAchievementsModalOpen}
          handleCloseAchievements={() => setIsAchievementsModalOpen(false)}
        />
        <AlertContainer />
      </div>
      {pendingCloudSave && (
        <CloudSaveConflictOverlay
          cloudSave={pendingCloudSave}
          isMobile={isMobile}
          onResolved={resolvePendingCloudSave}
        />
      )}
      {isCelebrating && (
        <WinCelebrationOverlay
          solution={solution}
          onDone={handleCelebrationDone}
        />
      )}
      {isRevealingAchievement && (
        <AchievementRevealOverlay onDone={handleAchievementRevealDone} />
      )}
    </div>
  );
}

export default App;
