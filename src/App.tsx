import React, { useState, useEffect, useRef, useMemo, Suspense } from "react";
import { m } from "framer-motion";
import RibbonIcon from "./assets/icons/ribon.svg?react";

import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { AlertContainer } from "./components/Alert";
import { Navbar } from "./components/Navbar";
import { BackgroundStage } from "./components/backgrounds/BackgroundStage";
import { GameBanner } from "./components/GameBanner";
import { DisclaimerBanner } from "./components/DisclaimerBanner";
import { AttributionButton } from "./components/AttributionButton";
import { GameModals } from "./components/screens/GameModals";
import { useAchievements } from "./hooks/useAchievements";
import {
  BACKGROUNDS,
  type BackgroundId,
  loadBackgroundId,
} from "./lib/backgrounds";
import type { Achievement } from "./lib/achievements";
import type { CharStatus } from "./lib/statuses";

import {
  WinCelebration,
  AchievementReveal,
  MalformedChallengeScreen,
  MalformedDuelScreen,
  ExpiredDuelScreen,
  ActivityNotFoundScreen,
  ActivityWrongPlayerScreen,
  ActivityServerErrorScreen,
  CloudSaveConflictModal,
} from "./lazyComponents";

import { LoadingScreen } from "./components/screens/GameScreens";

import { useAlert } from "./context/alert-context";
import { useTilePainting } from "./hooks/useTilePainting";
import { useDuelResult } from "./hooks/useDuelResult";
import { useGameOutcome } from "./hooks/useGameOutcome";
import { useGameInitialization } from "./hooks/useGameInitialization";
import { useGameFlow } from "./hooks/useGameFlow";
import { useGuessInput } from "./hooks/useGuessInput";
import { useSaveGameState } from "./hooks/useSaveGameState";
import { useCrossTabSync } from "./hooks/useCrossTabSync";
import { useBackgroundAttribution } from "./hooks/useBackgroundAttribution";
import {
  completeEmailLinkSignIn,
  completeDiscordSignIn,
  useCloudAuth,
} from "./hooks/useCloudAuth";
import { useCloudSync } from "./hooks/useCloudSync";
import { getIdTokenForCurrentUser } from "./lib/cloudSync";

import { getRandomWord } from "./lib/words";
import { getStatusesFromCellColors } from "./lib/statuses";
import { computeFullyGrayLetters } from "./lib/rowAnalysis";
import {
  loadGameStateFromLocalStorage,
  loadSettingsFromLocalStorage,
} from "./lib/localStorage";
import { loadStats } from "./lib/stats";
import { isDiscordActivity } from "./lib/discord";
import { shareDailyResult } from "./lib/share";
import {
  fetchDailyConfig,
  getDailyNumber,
  loadDailyProgress,
  saveDailyResult,
  loadDailyResult,
  clearDailyProgress,
  recordDailyStats,
  loadDailyStats,
  pruneOldDailyEntries,
  submitDailyResult,
  DAILY_PATH,
  type DailyConfig,
  type DailyResult,
} from "./lib/daily";
import type { ChallengeConfig } from "./lib/challenge";
import type { DuelConfig } from "./lib/duel";
import type { GameMode } from "./lib/gameMode";

import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
  DISCOURAGE_INAPP_BROWSERS,
} from "./constants/settings";
import {
  GAME_COPIED_MESSAGE,
  DISCOURAGE_INAPP_BROWSER_TEXT,
} from "./constants/strings";

// icon (w-14 = 56px) + padding (p-2 = 8px * 2) + right border (border-2 = 2px) = 74px
const ACHIEVEMENT_TRAY_WIDTH = 74;

const challengeParam = new URLSearchParams(window.location.search).get(
  "challenge"
);
const duelParam = new URLSearchParams(window.location.search).get("duel");
const isDailyRoute = window.location.pathname === DAILY_PATH;

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

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

  const [solution, setSolution] = useState(savedGameState?.solution ?? "");
  const [guesses, setGuesses] = useState<string[]>(
    savedGameState?.guesses ?? []
  );
  const [cellColors, setCellColors] = useState<{ [key: string]: CharStatus }>(
    (savedGameState?.cellColors as { [key: string]: CharStatus }) ?? {}
  );
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentRowClass, setCurrentRowClass] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
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
  const [isActivityNotFound, setIsActivityNotFound] = useState(false);
  const [isActivityWrongPlayer, setIsActivityWrongPlayer] = useState(false);
  const [isActivityServerError, setIsActivityServerError] = useState(false);
  const [isDuelModalOpen, setIsDuelModalOpen] = useState(false);
  const [dailyConfig, setDailyConfig] = useState<DailyConfig | null>(null);
  const [isDailyActive, setIsDailyActive] = useState(false);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [dailyModalMode, setDailyModalMode] = useState<
    "loading" | "error" | "play" | "complete"
  >("loading");
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [dailyStats, setDailyStats] = useState(() => loadDailyStats());
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [leaderboardIdToken, setLeaderboardIdToken] = useState<string | null>(
    null
  );
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

  const submitDailyToLeaderboard = async (won: boolean) => {
    if (!user) return;
    const idToken = await getIdTokenForCurrentUser();
    if (!idToken) return;
    void submitDailyResult(idToken, won);
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
  const dailyNumber = dailyConfig ? getDailyNumber(dailyConfig.date) : 0;

  useEffect(() => {
    if (
      !isGameWon ||
      isDuelMode ||
      isChallengeMode ||
      achievementCheckedRef.current
    )
      return;
    achievementCheckedRef.current = true;
    const newly = recordWin({
      wordLength: solution.length,
      guessCount: guesses.length,
      hardMode,
      guesses,
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
    solution.length,
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
      if (isChallengeMode || isDuelMode) return;
      const newly = recordGuess(word, solution, guesses);
      if (newly.length > 0) {
        setNewlyUnlockedAchievements((prev) => [...prev, ...newly]);
        achievementRevealPendingRef.current = true;
        newly.forEach(announceAchievement);
      }
    },
    onDailyComplete: (won, guessCount) => {
      if (!dailyConfig) return;
      const result: DailyResult = {
        date: dailyConfig.date,
        won,
        guessCount,
        maxGuesses: maxChallenges,
        wordLength: dailyConfig.wordLength,
        completedAt: Date.now(),
      };
      saveDailyResult(result);
      setDailyResult(result);
      setDailyStats(recordDailyStats(dailyConfig.date, won));
      clearDailyProgress(dailyConfig.date);
      setDailyModalMode("complete");
      void submitDailyToLeaderboard(won);
    },
  });

  useGameInitialization({
    challengeParam,
    duelParam,
    isDailyRoute,
    restoredGameRef,
    duelSubmittedRef,
    setIsLoading,
    setIsMalformedChallenge,
    setIsMalformedDuel,
    setIsDuelExpired,
    setIsActivityNotFound,
    setIsActivityWrongPlayer,
    setIsActivityServerError,
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
    onDailyRestoredComplete: (won) => {
      void submitDailyToLeaderboard(won);
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
    setBackgroundId,
    setHiddenAttributionIds,
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    document.title = isDuelMode
      ? "Vagudle - Duel"
      : isChallengeMode
        ? "Vagudle - Challenge"
        : isDailyMode
          ? "Vagudle - Daily"
          : "Vagudle";
    return () => {
      document.title = "Vagudle";
    };
  }, [isChallengeMode, isDuelMode, isDailyMode]);

  useEffect(() => {
    if (!DISCOURAGE_INAPP_BROWSERS) return;
    let cancelled = false;
    void import("./lib/browser").then(({ isInAppBrowser }) => {
      if (!cancelled && isInAppBrowser()) {
        showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
          persist: false,
          durationMs: 7000,
        });
      }
    });
    return () => {
      cancelled = true;
    };
  }, [showErrorAlert]);

  const handleOpenDaily = async () => {
    if (window.location.pathname !== DAILY_PATH) {
      window.history.pushState({}, "", DAILY_PATH);
    }
    setIsDailyModalOpen(true);
    setDailyModalMode("loading");
    const config = await fetchDailyConfig();
    if (!config) {
      setDailyModalMode("error");
      return;
    }
    setDailyConfig(config);

    const existingResult = loadDailyResult(config.date);
    if (existingResult) {
      setDailyResult(existingResult);
      setDailyModalMode("complete");
      return;
    }
    setDailyModalMode("play");
  };

  const handlePlayDaily = () => {
    if (!dailyConfig) return;
    const dailyMaxChallenges = dailyConfig.hardMode
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
    const progress = loadDailyProgress(dailyConfig.date);
    const restoredGuesses = progress?.guesses ?? [];
    const won = restoredGuesses.some(
      (guess) => guess.toUpperCase() === dailyConfig.word
    );
    const lost = !won && restoredGuesses.length >= dailyMaxChallenges;

    dismissAlert();
    setIsDailyActive(true);
    setSolution(dailyConfig.word);
    setGuesses(restoredGuesses);
    setCellColors(
      (progress?.cellColors as { [key: string]: CharStatus }) ?? {}
    );
    setCurrentGuess("");
    setCurrentRowClass("");
    setIsGameWon(won);
    setIsGameLost(lost);
    setIsDailyModalOpen(false);

    if (won || lost) {
      const result: DailyResult = {
        date: dailyConfig.date,
        won,
        guessCount: restoredGuesses.length,
        maxGuesses: dailyMaxChallenges,
        wordLength: dailyConfig.wordLength,
        completedAt: Date.now(),
      };
      saveDailyResult(result);
      setDailyResult(result);
      setDailyStats(recordDailyStats(dailyConfig.date, won));
      clearDailyProgress(dailyConfig.date);
      void submitDailyToLeaderboard(won);
    }
  };

  const handleShareDaily = () => {
    if (!dailyConfig) return;
    void shareDailyResult(
      dailyConfig.word,
      guesses,
      isGameLost,
      dailyNumber,
      dailyResult?.maxGuesses ?? maxChallenges,
      () => showSuccessAlert(GAME_COPIED_MESSAGE)
    );
  };

  const handleCloseDaily = () => {
    setIsDailyModalOpen(false);
    if (isDailyMode) {
      handleReturnToNormal();
    } else if (window.location.pathname === DAILY_PATH) {
      window.history.pushState({}, "", "/");
    }
  };

  const handleOpenLeaderboard = async () => {
    const idToken = await getIdTokenForCurrentUser();
    setLeaderboardIdToken(idToken ?? null);
    setIsDailyModalOpen(false);
    setIsLeaderboardModalOpen(true);
  };

  const handleCloseLeaderboard = () => {
    setIsLeaderboardModalOpen(false);
    if (isDailyMode) setIsDailyModalOpen(true);
  };

  const handleOpenSettingsFromLeaderboard = () => {
    setIsLeaderboardModalOpen(false);
    setSettingsAccountJumpKey((key) => key + 1);
    setIsSettingsModalOpen(true);
  };

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
      />
      {showAttributionButton && (
        <AttributionButton
          onClick={() => setIsAttributionModalOpen(true)}
          keyboardRef={keyboardRef}
          isMobile={isMobile}
        />
      )}
      {!isChallengeMode && !isDuelMode && (
        <m.div
          className="fixed left-0 z-20 flex items-stretch"
          style={{ top: "4.5rem" }}
          initial={false}
          animate={{ x: isTrayOpen ? 0 : -ACHIEVEMENT_TRAY_WIDTH }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <button
            type="button"
            className="p-2 flex items-center justify-center bg-obsidian-900/95 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/50 transition-colors"
            style={{ borderLeft: "none", borderRadius: 0 }}
            onClick={() => setIsAchievementsModalOpen(true)}
            aria-label="Achievements"
          >
            <RibbonIcon className="w-14 h-14" />
          </button>
          <button
            type="button"
            className="flex items-center justify-center px-1.5 bg-obsidian-900/95 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/50 hover:bg-obsidian-700 transition-colors text-crown-gold"
            style={{ borderLeft: "none", borderRadius: "0 6px 6px 0" }}
            onClick={() => setIsTrayOpen((prev) => !prev)}
            aria-label={
              isTrayOpen ? "Hide achievements tray" : "Show achievements tray"
            }
          >
            <span style={{ fontSize: "16px", lineHeight: 1 }}>
              {isTrayOpen ? "‹" : "›"}
            </span>
          </button>
        </m.div>
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
            isChallengeMode={isChallengeMode}
            challengeConfig={challengeConfig}
            isDuelMode={isDuelMode}
            duelConfig={duelConfig}
            isDailyMode={isDailyMode}
            dailyConfig={dailyConfig}
            dailyNumber={dailyNumber}
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
          isLeaderboardModalOpen={isLeaderboardModalOpen}
          handleOpenLeaderboard={handleOpenLeaderboard}
          handleCloseLeaderboard={handleCloseLeaderboard}
          handleOpenSettingsFromLeaderboard={handleOpenSettingsFromLeaderboard}
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
        <Suspense fallback={null}>
          <CloudSaveConflictModal
            cloudSave={pendingCloudSave}
            isMobile={isMobile}
            onResolved={resolvePendingCloudSave}
          />
        </Suspense>
      )}
      {isCelebrating && (
        <Suspense fallback={null}>
          <WinCelebration
            word={solution}
            onDone={() => {
              setIsCelebrating(false);
              if (achievementRevealPendingRef.current) {
                achievementRevealPendingRef.current = false;
                setIsRevealingAchievement(true);
              } else if (isDuelMode) {
                setIsDuelModalOpen(true);
              } else if (isDailyMode) {
                setIsDailyModalOpen(true);
              } else {
                setIsStatsModalOpen(true);
              }
            }}
          />
        </Suspense>
      )}
      {isRevealingAchievement && (
        <Suspense fallback={null}>
          <AchievementReveal
            onDone={() => {
              setIsRevealingAchievement(false);
              if (isDuelMode) setIsDuelModalOpen(true);
              else if (isDailyMode) setIsDailyModalOpen(true);
              else setIsStatsModalOpen(true);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
