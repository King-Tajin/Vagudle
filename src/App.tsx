import React, { useState, useEffect, useRef, Suspense, lazy } from "react";
import { motion } from "framer-motion";

import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { InfoModal } from "./components/modals/InfoModal";
import { AlertContainer } from "./components/Alert";
import { Navbar } from "./components/Navbar";
import { BackgroundGrid } from "./components/background/BackgroundGrid";
import { TajinRain } from "./components/background/TajinRain";
import { GameBanner } from "./components/GameBanner";
import {
  LoadingScreen,
  MalformedChallengeScreen,
  MalformedDuelScreen,
  ExpiredDuelScreen,
  ActivityNotFoundScreen,
  ActivityWrongPlayerScreen,
  ActivityServerErrorScreen,
} from "./components/screens/GameScreens";

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

import { useAlert } from "./context/AlertContext";
import { tilePainting } from "./hooks/tilePainting";
import { duelResult } from "./hooks/duelResult";
import { gameOutcome } from "./hooks/gameOutcome";
import { gameInitialization } from "./hooks/gameInitialization";
import { gameFlow } from "./hooks/gameFlow";
import { guessInput } from "./hooks/guessInput";
import { saveGameState } from "./hooks/saveGameState";

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
  const [activityInstanceId, setActivityInstanceId] = useState<string | null>(
    null
  );
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
  const [stats, setStats] = useState(() => loadStats(false));
  const [hardStats, setHardStats] = useState(() => loadStats(true));

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

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredGameRef = useRef(false);
  const duelSubmittedRef = useRef(false);
  const keyboardRef = useRef<HTMLDivElement>(null);
  const extraEffectsRef = useRef(extraEffects);
  useEffect(() => {
    extraEffectsRef.current = extraEffects;
  }, [extraEffects]);

  const {
    cellColors,
    setCellColors,
    autoGrayLetters,
    setAutoGrayLetters,
    onCellPaint,
    onRowReset,
    onFullReset,
    clearAutoGray,
  } = tilePainting({ guesses, solution, autoGray, autoGreen });

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

  const duelSaveStatus = duelResult({
    isDuelMode,
    duelToken,
    activityInstanceId,
    activityAccessToken,
    isGameWon,
    isGameLost,
    guessCount: guesses.length,
    submittedRef: duelSubmittedRef,
  });

  gameOutcome({
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
  } = gameFlow({
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
    setCellColors,
    setAutoGrayLetters,
    setIsGameWon,
    setIsGameLost,
    setIsStatsModalOpen,
    setStats,
    setHardStats,
    dismissAlert,
  });

  const { onChar, onDelete, onEnter } = guessInput({
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
  });

  gameInitialization({
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
    setActivityInstanceId,
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
    showErrorAlert,
  });

  saveGameState({
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
    DISCOURAGE_INAPP_BROWSERS &&
      isInAppBrowser() &&
      showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      });
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

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      <BackgroundGrid />
      <TajinRain keyboardRef={keyboardRef} />
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

        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={() => setIsInfoModalOpen(false)}
        />

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
            challengeConfig={
              isDuelMode
                ? (duelConfig as any)
                : isChallengeMode
                ? challengeConfig
                : null
            }
            isActivityMode={isDiscordActivity}
          />
          {isChallengeMode && challengeConfig && (
            <ChallengeAcceptModal
              isOpen={isChallengeModalOpen}
              onPlay={() => setIsChallengeModalOpen(false)}
              config={challengeConfig!}
            />
          )}
          {isDuelMode && duelConfig && (
            <DuelModal
              isOpen={isDuelModalOpen}
              mode={isGameWon || isGameLost ? "complete" : "accept"}
              config={duelConfig!}
              onPlay={() => setIsDuelModalOpen(false)}
              onReturn={handleReturnToNormal}
              saveStatus={duelSaveStatus}
              isActivityMode={isDiscordActivity}
            />
          )}
        </Suspense>

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
