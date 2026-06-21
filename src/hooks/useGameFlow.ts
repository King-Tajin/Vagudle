import type { CharStatus } from "../lib/statuses";
import type { GameStats } from "../lib/localStorage";
import {
  addStatsForCompletedGame,
  loadStats,
  saveStatsToLocalStorage,
} from "../lib/stats";
import { getRandomWord } from "../lib/words";
import React from "react";

type Params = {
  wordLength: number;
  hardMode: boolean;
  guesses: string[];
  isGameWon: boolean;
  isGameLost: boolean;
  isDuelMode: boolean;
  isChallengeMode: boolean;
  maxChallenges: number;
  revealTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setWordLength: (v: number) => void;
  setSolution: (v: string) => void;
  setGuesses: (v: string[]) => void;
  setCurrentGuess: (v: string) => void;
  setCurrentRowClass: (v: string) => void;
  setCellColors: React.Dispatch<
    React.SetStateAction<{ [key: string]: CharStatus }>
  >;
  setAutoGrayLetters: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsGameWon: (v: boolean) => void;
  setIsGameLost: (v: boolean) => void;
  setIsStatsModalOpen: (v: boolean) => void;
  setStats: (v: GameStats) => void;
  setHardStats: (v: GameStats) => void;
  dismissAlert: () => void;
};

type Return = {
  handleNewGame: (length?: number) => void;
  handleReturnToNormal: () => void;
  handleNewGameWithFail: () => void;
  handleWordLengthChange: (length: number) => void;
  recordStats: (count: number) => void;
  hasActiveGame: boolean;
};

export const useGameFlow = ({
  wordLength,
  hardMode,
  guesses,
  isGameWon,
  isGameLost,
  isDuelMode,
  isChallengeMode,
  maxChallenges,
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
}: Params): Return => {
  const recordStats = (count: number) => {
    const base = loadStats(hardMode);
    const updated = addStatsForCompletedGame(base, count, maxChallenges);
    saveStatsToLocalStorage(updated, hardMode);
    if (hardMode) {
      setHardStats(updated);
    } else {
      setStats(updated);
    }
  };

  const handleNewGame = (length: number = wordLength) => {
    dismissAlert();
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    const newSolution = getRandomWord(length, hardMode);
    setSolution(newSolution);
    setGuesses([]);
    setCurrentGuess("");
    setCurrentRowClass("");
    setCellColors({});
    setAutoGrayLetters(new Set());
    setIsGameWon(false);
    setIsGameLost(false);
    setIsStatsModalOpen(false);
  };

  const handleReturnToNormal = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  const hasActiveGame = guesses.length > 0 && !isGameWon && !isGameLost;

  const handleNewGameWithFail = () => {
    if (isDuelMode || isChallengeMode) {
      handleReturnToNormal();
      return;
    }
    if (hasActiveGame) {
      recordStats(maxChallenges);
    }
    handleNewGame();
  };

  const handleWordLengthChange = (length: number) => {
    setWordLength(length);
    handleNewGame(length);
  };

  return {
    handleNewGame,
    handleReturnToNormal,
    handleNewGameWithFail,
    handleWordLengthChange,
    recordStats,
    hasActiveGame,
  };
};
