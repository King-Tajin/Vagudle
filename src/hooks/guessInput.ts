import type { CharStatus } from "../lib/statuses";
import { isWordInWordList, isWinningWord, unicodeLength } from "../lib/words";
import {
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
} from "../constants/strings";
import { REVEAL_TIME_MS } from "../constants/settings";
import React from "react";

type Params = {
  currentGuess: string;
  solution: string;
  guesses: string[];
  maxChallenges: number;
  isGameWon: boolean;
  isGameLost: boolean;
  isChallengeMode: boolean;
  isDuelMode: boolean;
  revealTimerRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
  setCurrentGuess: (v: string) => void;
  setCurrentRowClass: (v: string) => void;
  setIsRevealing: (v: boolean) => void;
  setGuesses: (v: string[]) => void;
  setIsGameWon: (v: boolean) => void;
  setIsGameLost: (v: boolean) => void;
  setCellColors: React.Dispatch<
    React.SetStateAction<{ [key: string]: CharStatus }>
  >;
  showErrorAlert: (
    message: string,
    options?: { onClose?: () => void; persist?: boolean; delayMs?: number }
  ) => void;
  recordStats: (count: number) => void;
};

type Return = {
  onChar: (value: string) => void;
  onDelete: () => void;
  onEnter: () => void;
};

export const guessInput = ({
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
}: Params): Return => {
  const clearCurrentRowClass = () => setCurrentRowClass("");

  const onChar = (value: string) => {
    if (
      unicodeLength(`${currentGuess}${value}`) <= solution.length &&
      guesses.length < maxChallenges &&
      !isGameWon &&
      !isGameLost
    ) {
      setCurrentGuess(`${currentGuess}${value}`);
    }
  };

  const onDelete = () => {
    if (isGameWon || isGameLost) return;
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const onEnter = () => {
    if (isGameWon || isGameLost) return;

    if (!(unicodeLength(currentGuess) === solution.length)) {
      setCurrentRowClass("");
      requestAnimationFrame(() => setCurrentRowClass("jiggle"));
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      });
    }

    if (!isWordInWordList(currentGuess)) {
      setCurrentRowClass("");
      requestAnimationFrame(() => setCurrentRowClass("jiggle"));
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      });
    }

    setIsRevealing(true);
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    revealTimerRef.current = setTimeout(
      () => setIsRevealing(false),
      REVEAL_TIME_MS * solution.length
    );

    const winningWord = isWinningWord(currentGuess, solution);

    if (
      unicodeLength(currentGuess) === solution.length &&
      guesses.length < maxChallenges &&
      !isGameWon
    ) {
      setGuesses([...guesses, currentGuess]);
      setCurrentGuess("");

      if (winningWord) {
        const winRowIndex = guesses.length;
        setCellColors((prev) => {
          const next = { ...prev };
          currentGuess.split("").forEach((_, c) => {
            next[`${winRowIndex}-${c}`] = "correct";
          });
          return next;
        });

        if (!isChallengeMode && !isDuelMode) recordStats(guesses.length);
        return setIsGameWon(true);
      }

      if (guesses.length === maxChallenges - 1) {
        if (!isChallengeMode && !isDuelMode) recordStats(guesses.length + 1);
        setIsGameLost(true);
        if (!isChallengeMode && !isDuelMode) {
          showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
            persist: true,
            delayMs: REVEAL_TIME_MS * solution.length + 1,
          });
        }
      }
    }
  };

  return { onChar, onDelete, onEnter };
};
