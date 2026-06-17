import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion } from "framer-motion";
import RibbonIcon from "./assets/icons/ribon.svg";

import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { AlertContainer } from "./components/Alert";
import { Navbar } from "./components/Navbar";
import { BackgroundGrid } from "./components/background/BackgroundGrid";
import { VagudleSprinkles } from "./components/background/VagudleSprinkles";
import { VideoBackground } from "./components/background/VideoBackground";
import { GameBanner } from "./components/GameBanner";
import { AchievementsModal } from "./components/modals/AchievementsModal";
import { useAchievements } from "./hooks/useAchievements";
import {
  BACKGROUNDS,
  type BackgroundId,
  loadBackgroundId,
  saveBackgroundId,
} from "./lib/backgrounds";
import type { Achievement } from "./lib/achievements";

const InfoModal = lazy(() =>
  import("./components/modals/InfoModal").then((m) => ({
    default: m.InfoModal,
  }))
);
const TajinRain = lazy(() =>
  import("./components/background/TajinRain").then((m) => ({
    default: m.TajinRain,
  }))
);
const StatsModal = lazy(() =>
  import("./components/modals/StatsModal").then((m) => ({
    default: m.StatsModal,
  }))
);
const SettingsModal = lazy(() =>
  import("./components/modals/SettingsModal").then((m) => ({
    default: m.SettingsModal,
  }))
);
const ChallengeAcceptModal = lazy(() =>
  import("./components/modals/ChallengeAcceptModal").then((m) => ({
    default: m.ChallengeAcceptModal,
  }))
);
const DuelModal = lazy(() =>
  import("./components/modals/DuelModal").then((m) => ({
    default: m.DuelModal,
  }))
);
const WinCelebration = lazy(() =>
  import("./components/screens/WinCelebration").then((m) => ({
    default: m.WinCelebration,
  }))
);

import {
  LoadingScreen,
  MalformedChallengeScreen,
  MalformedDuelScreen,
  ExpiredDuelScreen,
  ActivityNotFoundScreen,
  ActivityWrongPlayerScreen,
  ActivityServerErrorScreen,
} from "./components/screens/GameScreens";

import { useAlert } from "./context/AlertContext";
import { useTilePainting } from "./hooks/useTilePainting";
import { useDuelResult } from "./hooks/useDuelResult";
import { useGameOutcome } from "./hooks/useGameOutcome";
import { useGameInitialization } from "./hooks/useGameInitialization";
import { useGameFlow } from "./hooks/useGameFlow";
import { useGuessInput } from "./hooks/useGuessInput";
import { useSaveGameState } from "./hooks/useSaveGameState";

import { getRandomWord } from "./lib/words";
import { getStatusesFromCellColors } from "./lib/statuses";
import {
  loadGameStateFromLocalStorage,
  loadSettingsFromLocalStorage,
} from "./lib/localStorage";
import { loadStats } from "./lib/stats";
import { isDiscordActivity } from "./lib/discord";
import { isInAppBrowser } from "./lib/browser";
import type { ChallengeConfig } from "./lib/challenge";
import type { DuelConfig } from "./lib/duel";

import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
  DISCOURAGE_INAPP_BROWSERS,
} from "./constants/settings";
import {
  GAME_COPIED_MESSAGE,
  DISCOURAGE_INAPP_BROWSER_TEXT,
} from "./constants/strings";

const IS_MOBILE = window.innerWidth < 640;

// icon (w-14 = 56px) + padding (p-2 = 8px * 2) + right border (border-2 = 2px) = 74px
const ACHIEVEMENT_TRAY_WIDTH = 74;

const challengeParam = new URLSearchParams(window.location.search).get(
  "challenge"
);
const duelParam = new URLSearchParams(window.location.search).get("duel");

function App() {
  const {
    showError: showErrorAlert,
    showSuccess: showSuccessAlert,
    dismiss: dismissAlert,
  } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [solution, setSolution] = useState(
    () => loadGameStateFromLocalStorage()?.solution ?? ""
  );
  const [guesses, setGuesses] = useState<string[]>(
    () => loadGameStateFromLocalStorage()?.guesses ?? []
  );
  const [currentGuess, setCurrentGuess] = useState("");
  const [currentRowClass, setCurrentRowClass] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [isGameLost, setIsGameLost] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isCelebrating, setIsCelebrating] = useState(false);
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
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [isAchievementsModalOpen, setIsAchievementsModalOpen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(true);
  const [stats, setStats] = useState(() => loadStats(false));
  const [hardStats, setHardStats] = useState(() => loadStats(true));
  const [newlyUnlockedAchievements, setNewlyUnlockedAchievements] = useState<
    Achievement[]
  >([]);

  const [wordLength, setWordLength] = useState(
    () => loadSettingsFromLocalStorage().wordLength
  );
  const [hardMode, setHardMode] = useState(
    () => loadSettingsFromLocalStorage().hardMode
  );
  const [showGrayCount, setShowGrayCount] = useState(
    () => loadSettingsFromLocalStorage().showGrayCount
  );
  const [autoGray, setAutoGray] = useState(
    () => loadSettingsFromLocalStorage().autoGray ?? false
  );
  const [autoGreen, setAutoGreen] = useState(
    () => loadSettingsFromLocalStorage().autoGreen ?? false
  );
  const [extraEffects, setExtraEffects] = useState(
    () => loadSettingsFromLocalStorage().extraEffects ?? true
  );
  const [backgroundId, setBackgroundId] = useState<BackgroundId>(() =>
    loadBackgroundId(IS_MOBILE)
  );

  const { unlockedIds, recordWin, recordGuess, resetWinRecord } =
    useAchievements();

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredGameRef = useRef(false);
  const duelSubmittedRef = useRef(false);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const achievementCheckedRef = useRef(false);
  const hasAutoClosedTrayRef = useRef(false);
  const extraEffectsRef = useRef(extraEffects);
  useEffect(() => {
    extraEffectsRef.current = extraEffects;
  }, [extraEffects]);

  useEffect(() => {
    saveBackgroundId(backgroundId);
  }, [backgroundId]);

  useEffect(() => {
    achievementCheckedRef.current = false;
    resetWinRecord();
    setNewlyUnlockedAchievements([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solution]);

  useEffect(() => {
    setIsTrayOpen(true);
    hasAutoClosedTrayRef.current = false;
  }, [solution]);

  useEffect(() => {
    if (IS_MOBILE && guesses.length === 1 && !hasAutoClosedTrayRef.current) {
      hasAutoClosedTrayRef.current = true;
      setIsTrayOpen(false);
    }
  }, [guesses.length]);

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
    });
    if (newly.length > 0)
      setNewlyUnlockedAchievements((prev) => [...prev, ...newly]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameWon]);

  const {
    cellColors,
    setCellColors,
    autoGrayLetters,
    setAutoGrayLetters,
    onCellPaint,
    onRowReset,
    onFullReset,
    clearAutoGray,
  } = useTilePainting({ guesses, solution, autoGray, autoGreen });

  const isChallengeMode = challengeConfig !== null;
  const isDuelMode = duelConfig !== null;
  const maxChallenges =
    duelConfig?.guesses ??
    challengeConfig?.guesses ??
    (hardMode ? HARD_MODE_MAX_CHALLENGES : NORMAL_MODE_MAX_CHALLENGES);
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
    restoredRef: restoredGameRef,
    extraEffectsRef,
    showSuccessAlert,
    setIsCelebrating,
    setIsDuelModalOpen,
    setIsStatsModalOpen,
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
    maxChallenges,
    stats,
    hardStats,
    revealTimerRef,
    setWordLength,
    setSolution,
    setGuesses,
    setCurrentGuess,
    setCurrentRowClass,
    setCellColors,
    setAutoGrayLetters,
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
    onGuessSubmit: (word) => {
      const newly = recordGuess(word);
      if (newly.length > 0) {
        setNewlyUnlockedAchievements((prev) => [...prev, ...newly]);
        newly.forEach(announceAchievement);
      }
    },
  });

  useGameInitialization({
    challengeParam,
    duelParam,
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
    setAutoGrayLetters,
    setIsGameWon,
    setIsGameLost,
    setIsChallengeModalOpen,
    setIsDuelModalOpen,
    setIsInfoModalOpen,
    setIsStatsModalOpen,
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
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    document.title = isDuelMode
      ? "Vagudle - Duel"
      : isChallengeMode
      ? "Vagudle - Challenge"
      : "Vagudle";
    return () => {
      document.title = "Vagudle";
    };
  }, [isChallengeMode, isDuelMode]);

  useEffect(() => {
    if (DISCOURAGE_INAPP_BROWSERS && isInAppBrowser()) {
      showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      });
    }
  }, [showErrorAlert]);

  if (isLoading) return <LoadingScreen />;
  if (isActivityNotFound) return <ActivityNotFoundScreen />;
  if (isActivityWrongPlayer) return <ActivityWrongPlayerScreen />;
  if (isActivityServerError) return <ActivityServerErrorScreen />;
  if (isMalformedChallenge)
    return (
      <MalformedChallengeScreen handleReturnToNormal={handleReturnToNormal} />
    );
  if (isMalformedDuel)
    return <MalformedDuelScreen handleReturnToNormal={handleReturnToNormal} />;
  if (isDuelExpired)
    return <ExpiredDuelScreen handleReturnToNormal={handleReturnToNormal} />;

  const renderBackground = () => {
    const bg = BACKGROUNDS.find((b) => b.id === backgroundId);

    if (bg?.kind === "video" && bg.videoSrc) {
      return (
        <VideoBackground
          key={bg.videoSrc}
          src={bg.videoSrc}
          posterSrc={bg.posterSrc}
          audioEnabled={extraEffects}
          objectPosition={bg.objectPosition}
          label={bg.desktopLabel}
        />
      );
    }

    switch (backgroundId) {
      case "sprinkles":
        return IS_MOBILE ? (
          <div
            className="fixed inset-0 pointer-events-none"
            style={{ background: "#0d1322", zIndex: 0 }}
          />
        ) : (
          <VagudleSprinkles keyboardRef={keyboardRef} />
        );
      case "tajin":
        return IS_MOBILE ? (
          <BackgroundGrid />
        ) : (
          <>
            <BackgroundGrid />
            <Suspense fallback={null}>
              <TajinRain keyboardRef={keyboardRef} />
            </Suspense>
          </>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      {renderBackground()}

      {!isChallengeMode && !isDuelMode && (
        <motion.div
          className="fixed left-0 z-20 flex items-stretch"
          style={{ top: "4.5rem" }}
          initial={false}
          animate={{ x: isTrayOpen ? 0 : -ACHIEVEMENT_TRAY_WIDTH }}
          transition={{ type: "spring", stiffness: 280, damping: 28 }}
        >
          <button
            className="p-2 flex items-center justify-center bg-obsidian-900/95 backdrop-blur-sm border-2 border-obsidian-600/50 hover:border-crown-gold/50 transition-colors"
            style={{ borderLeft: "none", borderRadius: 0 }}
            onClick={() => setIsAchievementsModalOpen(true)}
            aria-label="Achievements"
          >
            <img src={RibbonIcon} alt="Achievements" className="w-14 h-14" />
          </button>
          <button
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
        </motion.div>
      )}

      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        handleNewGame={handleNewGameWithFail}
        hasActiveGame={hasActiveGame}
        isChallengeMode={isChallengeMode}
        isDuelMode={isDuelMode}
        isInfoModalOpen={isInfoModalOpen}
        isActivityMode={isDiscordActivity}
      />

      <div className="relative pt-2 px-1 pb-44 md:max-w-7xl w-full mx-auto sm:px-6 lg:px-8 flex flex-col grow">
        <div className="pb-6 grow">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-pixel text-center text-4xl text-crown-gold crown-glow tracking-widest mb-4"
          >
            VAGUDLE
          </motion.p>

          <GameBanner
            isChallengeMode={isChallengeMode}
            challengeConfig={challengeConfig}
            isDuelMode={isDuelMode}
            duelConfig={duelConfig}
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

        <Suspense fallback={null}>
          <InfoModal
            isOpen={isInfoModalOpen}
            handleClose={() => setIsInfoModalOpen(false)}
          />
        </Suspense>

        <Suspense fallback={null}>
          <StatsModal
            isOpen={isStatsModalOpen}
            handleClose={() => setIsStatsModalOpen(false)}
            solution={solution}
            guesses={guesses}
            gameStats={stats}
            hardGameStats={hardStats}
            isGameLost={isGameLost}
            isGameWon={isGameWon}
            handleShareToClipboard={() => showSuccessAlert(GAME_COPIED_MESSAGE)}
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
              isDuelMode && !isDiscordActivity
                ? handleReturnToNormal
                : undefined
            }
            isActivityMode={isDiscordActivity}
            duelConfig={isDuelMode ? duelConfig : null}
            newlyUnlockedAchievements={newlyUnlockedAchievements}
            onAchievementsViewed={() => setNewlyUnlockedAchievements([])}
          />
          <SettingsModal
            isOpen={isSettingsModalOpen}
            handleClose={() => setIsSettingsModalOpen(false)}
            wordLength={wordLength}
            hasStarted={guesses.length > 0}
            onWordLengthChange={handleWordLengthChange}
            showGrayCount={showGrayCount}
            setShowGrayCount={setShowGrayCount}
            hardMode={hardMode}
            setHardMode={(value: boolean) => {
              setHardMode(value);
              if (guesses.length === 0)
                setSolution(getRandomWord(wordLength, value));
            }}
            autoGray={autoGray}
            setAutoGray={handleSetAutoGray}
            autoGreen={autoGreen}
            setAutoGreen={setAutoGreen}
            extraEffects={extraEffects}
            setExtraEffects={setExtraEffects}
            backgroundId={backgroundId}
            setBackgroundId={setBackgroundId}
            unlockedAchievementIds={unlockedIds}
            isMobile={IS_MOBILE}
            challengeConfig={
              isDuelMode ? duelConfig : isChallengeMode ? challengeConfig : null
            }
            isActivityMode={isDiscordActivity}
          />
          {isChallengeMode && challengeConfig && (
            <ChallengeAcceptModal
              isOpen={isChallengeModalOpen}
              onPlay={() => setIsChallengeModalOpen(false)}
              config={challengeConfig}
            />
          )}
          {isDuelMode && duelConfig && (
            <DuelModal
              isOpen={isDuelModalOpen}
              mode={isGameWon || isGameLost ? "complete" : "accept"}
              config={duelConfig}
              onPlay={() => setIsDuelModalOpen(false)}
              onReturn={handleReturnToNormal}
              saveStatus={duelSaveStatus}
              isActivityMode={isDiscordActivity}
            />
          )}
        </Suspense>

        <AchievementsModal
          isOpen={isAchievementsModalOpen}
          handleClose={() => setIsAchievementsModalOpen(false)}
          unlockedIds={unlockedIds}
        />

        <AlertContainer />
      </div>

      {isCelebrating && (
        <Suspense fallback={null}>
          <WinCelebration
            word={solution}
            onDone={() => {
              setIsCelebrating(false);
              if (isDuelMode) setIsDuelModalOpen(true);
              else setIsStatsModalOpen(true);
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;
