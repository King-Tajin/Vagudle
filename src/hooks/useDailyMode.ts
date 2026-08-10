import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { CharStatus } from "../lib/statuses";
import { getIdTokenForCurrentUser } from "../lib/cloudSync";
import type { ShowOptions } from "../context/alert-context";
import type { CloudAuthUser } from "./useCloudAuth";
import { useUsernameStatus } from "./useUsernameStatus";
import { handleReturnToNormal } from "./useGameFlow";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../constants/settings";
import { GAME_COPIED_MESSAGE } from "../constants/strings";
import { shareDailyResult } from "../lib/share";
import {
  fetchDailyConfig,
  getDailyNumber,
  loadDailyProgress,
  saveDailyProgress,
  saveDailyResult,
  loadDailyResult,
  clearDailyProgress,
  recordDailyStats,
  loadDailyStats,
  submitDailyResult,
  fetchServerDailyProgress,
  DAILY_PATH,
  type DailyConfig,
  type DailyResult,
} from "../lib/daily";

type Params = {
  user: CloudAuthUser | null;
  setIsDailyActive: React.Dispatch<React.SetStateAction<boolean>>;
  isDailyMode: boolean;
  guesses: string[];
  isGameLost: boolean;
  restoredGameRef: React.RefObject<boolean>;
  dismissAlert: () => void;
  showSuccessAlert: (message: string, options?: ShowOptions) => void;
  setSolution: (value: React.SetStateAction<string>) => void;
  setGuesses: (value: React.SetStateAction<string[]>) => void;
  setCellColors: (
    value: React.SetStateAction<{ [key: string]: CharStatus }>
  ) => void;
  setCurrentGuess: (value: React.SetStateAction<string>) => void;
  setCurrentRowClass: (value: React.SetStateAction<string>) => void;
  setIsGameWon: (value: React.SetStateAction<boolean>) => void;
  setIsGameLost: (value: React.SetStateAction<boolean>) => void;
};

export const useDailyMode = ({
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
}: Params) => {
  const [dailyConfig, setDailyConfig] = useState<DailyConfig | null>(null);
  const [isDailyModalOpen, setIsDailyModalOpen] = useState(false);
  const [dailyModalMode, setDailyModalMode] = useState<
    "loading" | "error" | "play" | "complete"
  >("loading");
  const [dailyResult, setDailyResult] = useState<DailyResult | null>(null);
  const [dailyStats, setDailyStats] = useState(() => loadDailyStats());
  const [isDailyScheduleModalOpen, setIsDailyScheduleModalOpen] =
    useState(false);

  const hasUsername = useUsernameStatus(user);

  const dailyNumber = dailyConfig
    ? getDailyNumber(dailyConfig.date, dailyConfig.originDate)
    : 0;
  const dailyUsernameWarning = !user
    ? "Sign in to save to the leaderboard"
    : hasUsername === false
      ? "Set a username to save to the leaderboard"
      : null;

  const dailyLeaderboardSubmittedForRef = useRef<string | null>(null);

  const submitDailyToLeaderboard = async (date: string, won: boolean) => {
    if (!user) return;
    if (dailyLeaderboardSubmittedForRef.current === date) return;
    const idToken = await getIdTokenForCurrentUser();
    if (!idToken) return;
    const outcome = await submitDailyResult(idToken, won);
    if (outcome === "recorded" || outcome === "already_submitted") {
      dailyLeaderboardSubmittedForRef.current = date;
    }
  };

  const submitPendingDailyToLeaderboard = async () => {
    if (!user) return;
    const config = dailyConfig ?? (await fetchDailyConfig());
    if (!config) return;
    const pendingResult =
      dailyResult?.date === config.date
        ? dailyResult
        : loadDailyResult(config.date);
    if (!pendingResult) return;
    await submitDailyToLeaderboard(config.date, pendingResult.won);
  };

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      if (!cancelled) await submitPendingDailyToLeaderboard();
    };
    void run();
    return () => {
      cancelled = true;
    };
    // Only the user id should retrigger this submission attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

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

  const handlePlayDaily = async () => {
    if (!dailyConfig) return;
    const dailyMaxChallenges = dailyConfig.hardMode
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
    let progress = loadDailyProgress(dailyConfig.date);
    const idToken = await getIdTokenForCurrentUser();
    if (idToken) {
      const serverProgress = await fetchServerDailyProgress(idToken);
      if (
        serverProgress &&
        serverProgress.guesses.length > (progress?.guesses.length ?? 0)
      ) {
        progress = serverProgress;
        saveDailyProgress(dailyConfig.date, serverProgress);
      }
    }
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
    if (won || lost) restoredGameRef.current = true;
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
        guesses: restoredGuesses,
        cellColors: progress?.cellColors,
      };
      saveDailyResult(result);
      setDailyResult(result);
      setDailyStats(recordDailyStats(dailyConfig.date, won));
      clearDailyProgress(dailyConfig.date);
      void submitDailyToLeaderboard(dailyConfig.date, won);
    }
  };

  const handleShareDaily = () => {
    if (!dailyConfig) return;
    const dailyMaxChallenges = dailyConfig.hardMode
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
    void shareDailyResult(
      dailyConfig.word,
      guesses,
      isGameLost,
      dailyNumber,
      dailyResult?.maxGuesses ?? dailyMaxChallenges,
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

  const handleOpenDailySchedule = () => {
    setIsDailyScheduleModalOpen(true);
  };

  const handleCloseDailySchedule = () => {
    setIsDailyScheduleModalOpen(false);
  };

  const handleViewDailyGame = () => {
    if (!dailyConfig || !dailyResult?.guesses) return;
    dismissAlert();
    restoredGameRef.current = true;
    setIsDailyActive(true);
    setSolution(dailyConfig.word);
    setGuesses(dailyResult.guesses);
    setCellColors(
      (dailyResult.cellColors as { [key: string]: CharStatus }) ?? {}
    );
    setCurrentGuess("");
    setCurrentRowClass("");
    setIsGameWon(dailyResult.won);
    setIsGameLost(!dailyResult.won);
    setIsDailyModalOpen(false);
  };

  const handleUsernameSaved = async () => {
    await submitPendingDailyToLeaderboard();
  };

  const handleDailyComplete = (
    won: boolean,
    guessCount: number,
    finalGuesses: string[],
    finalCellColors: { [key: string]: CharStatus }
  ) => {
    if (!dailyConfig) return;
    const dailyMaxChallenges = dailyConfig.hardMode
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
    const result: DailyResult = {
      date: dailyConfig.date,
      won,
      guessCount,
      maxGuesses: dailyMaxChallenges,
      wordLength: dailyConfig.wordLength,
      completedAt: Date.now(),
      guesses: finalGuesses,
      cellColors: finalCellColors,
    };
    saveDailyResult(result);
    setDailyResult(result);
    setDailyStats(recordDailyStats(dailyConfig.date, won));
    clearDailyProgress(dailyConfig.date);
    setDailyModalMode("complete");
    void submitDailyToLeaderboard(dailyConfig.date, won);
  };

  return {
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
    handleOpenDailySchedule,
    handleCloseDailySchedule,
    handleViewDailyGame,
    handleUsernameSaved,
    handleDailyComplete,
  };
};
