import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { InfoModal } from "./components/modals/InfoModal";
import { StatsModal } from "./components/modals/StatsModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import {
  WIN_MESSAGES,
  GAME_COPIED_MESSAGE,
  NOT_ENOUGH_LETTERS_MESSAGE,
  WORD_NOT_FOUND_MESSAGE,
  CORRECT_WORD_MESSAGE,
  DISCOURAGE_INAPP_BROWSER_TEXT,
} from "./constants/strings";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
  REVEAL_TIME_MS,
  WELCOME_INFO_MODAL_MS,
  DISCOURAGE_INAPP_BROWSERS,
} from "./constants/settings";
import {
  initWordLists,
  isWordInWordList,
  isWinningWord,
  unicodeLength,
  getRandomWord,
} from "./lib/words";
import { CharStatus, getStatusesFromCellColors, getGuessStatuses } from "./lib/statuses";
import { addStatsForCompletedGame, loadStats } from "./lib/stats";
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage,
} from "./lib/localStorage";

import { AlertContainer } from "./components/Alert";
import { useAlert } from "./context/AlertContext";
import { Navbar } from "./components/Navbar";
import { isInAppBrowser } from "./lib/browser";

const isRowFullyGray = (solution: string, guess: string): boolean => {
  if (!guess) return false;
  const statuses = getGuessStatuses(solution, guess);
  return statuses.every((s) => s === "absent");
};

function App() {
  const {
    showError: showErrorAlert,
    showSuccess: showSuccessAlert,
    dismiss: dismissAlert,
  } = useAlert();

  const savedSettings = loadSettingsFromLocalStorage();
  const savedState = loadGameStateFromLocalStorage();

  const [isLoading, setIsLoading] = useState(true);
  const [wordLength, setWordLength] = useState(() => savedSettings.wordLength);
  const [hardMode, setHardMode] = useState(() => savedSettings.hardMode);
  const [solution, setSolution] = useState(savedState?.solution ?? "");
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [currentRowClass, setCurrentRowClass] = useState("");
  const [isGameLost, setIsGameLost] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showGrayCount, setShowGrayCount] = useState(
    () => savedSettings.showGrayCount
  );
  const [autoGray, setAutoGray] = useState(
    () => savedSettings.autoGray ?? false
  );
  const [autoGrayLetters, setAutoGrayLetters] = useState<Set<string>>(
    () => new Set((savedState?.autoGrayLetters ?? []) as string[])
  );
  const [autoGreen, setAutoGreen] = useState(
    () => savedSettings.autoGreen ?? false
  );
  const [guesses, setGuesses] = useState<string[]>([]);
  const [cellColors, setCellColors] = useState<{ [key: string]: CharStatus }>(
    () => (savedState?.cellColors as any) || {}
  );
  const [stats, setStats] = useState(() => loadStats(false));
  const [hardStats, setHardStats] = useState(() => loadStats(true));

  const maxChallenges = hardMode
    ? HARD_MODE_MAX_CHALLENGES
    : NORMAL_MODE_MAX_CHALLENGES;
  const userStatuses = getStatusesFromCellColors(guesses, cellColors);

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const loadStart = Date.now();
    initWordLists().then(() => {
      const elapsed = Date.now() - loadStart;
      const remaining = Math.max(0, 500 - elapsed);
      setTimeout(() => {
        if (savedState) {
          const gameWasWon = savedState.guesses.some(
            (g) => g.toUpperCase() === savedState.solution.toUpperCase()
          );
          setSolution(savedState.solution);
          setGuesses(savedState.guesses);
          if (gameWasWon) {
            setIsGameWon(true);
          } else if (savedState.guesses.length === maxChallenges) {
            setIsGameLost(true);
            showErrorAlert(CORRECT_WORD_MESSAGE(savedState.solution), {
              persist: true,
            });
          }
        } else {
          const newSolution = getRandomWord(
            savedSettings.wordLength,
            savedSettings.hardMode
          );
          setSolution(newSolution);
          setTimeout(() => setIsInfoModalOpen(true), WELCOME_INFO_MODAL_MS);
        }
        setIsLoading(false);
      }, remaining);
    });
  }, []);

  useEffect(() => {
    DISCOURAGE_INAPP_BROWSERS &&
      isInAppBrowser() &&
      showErrorAlert(DISCOURAGE_INAPP_BROWSER_TEXT, {
        persist: false,
        durationMs: 7000,
      });
  }, [showErrorAlert]);

  useEffect(() => {
    if (!autoGray) return;

    const fullyGrayLetters = new Set<string>();
    guesses.forEach((guess) => {
      if (isRowFullyGray(solution, guess)) {
        guess.split("").forEach((ch) => fullyGrayLetters.add(ch.toUpperCase()));
      }
    });

    setAutoGrayLetters((prev) => {
      const prevKey = Array.from(prev).sort().join(",");
      const nextKey = Array.from(fullyGrayLetters).sort().join(",");
      return prevKey === nextKey ? prev : new Set(fullyGrayLetters);
    });

    setCellColors((prev) => {
      const next = { ...prev };
      let changed = false;

      guesses.forEach((guess, r) => {
        guess.split("").forEach((ch, c) => {
          const key = `${r}-${c}`;
          if (fullyGrayLetters.has(ch.toUpperCase()) && next[key] !== "auto-absent") {
            next[key] = "auto-absent";
            changed = true;
          }
        });
      });

      Object.keys(next).forEach((key) => {
        if (next[key] !== "auto-absent") return;
        const parts = key.split("-");
        const r = parseInt(parts[0]);
        const c = parseInt(parts[1]);
        const letter = guesses[r]?.[c]?.toUpperCase();
        if (!letter || !fullyGrayLetters.has(letter)) {
          delete next[key];
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [cellColors, autoGray, guesses, solution]);

  useEffect(() => {
    if (!autoGreen || guesses.length === 0) return;

    const newRowIndex = guesses.length - 1;
    const newGuess = guesses[newRowIndex];
    if (!newGuess) return;

    setCellColors((prev) => {
      const next = { ...prev };
      let changed = false;

      newGuess.split("").forEach((letter, c) => {
        const key = `${newRowIndex}-${c}`;
        if (next[key]) return;

        for (let r = 0; r < newRowIndex; r++) {
          if (prev[`${r}-${c}`] === "correct") {
            if (guesses[r]?.[c]?.toUpperCase() === letter.toUpperCase()) {
              next[key] = "correct";
              changed = true;
              break;
            }
          }
        }
      });

      return changed ? next : prev;
    });
  }, [guesses, autoGreen]);

  const handleNewGame = (length: number = wordLength) => {
    dismissAlert();
    const newSolution = getRandomWord(length, hardMode);
    setSolution(newSolution);
    setGuesses([]);
    setCurrentGuess("");
    setCellColors({});
    setAutoGrayLetters(new Set());
    setIsGameWon(false);
    setIsGameLost(false);
    setIsStatsModalOpen(false);
  };

  const hasActiveGame = guesses.length > 0 && !isGameWon && !isGameLost;

  const handleNewGameWithFail = () => {
    if (hasActiveGame) {
      if (hardMode) {
        const updatedStats = addStatsForCompletedGame(
          hardStats,
          maxChallenges,
          maxChallenges,
          true
        );
        setHardStats(updatedStats);
      } else {
        const updatedStats = addStatsForCompletedGame(
          stats,
          maxChallenges,
          maxChallenges,
          false
        );
        setStats(updatedStats);
      }
      setIsGameLost(true);
    }
    handleNewGame();
  };

  const handleWordLengthChange = (length: number) => {
    setWordLength(length);
    handleNewGame(length);
  };

  const onCellPaint = (
    rowIndex: number,
    cellIndex: number,
    color: CharStatus
  ) => {
    const key = `${rowIndex}-${cellIndex}`;
    if (cellColors[key] === "auto-absent") return;

    setCellColors((prev) => {
      const next = { ...prev };
      const prevColor = prev[key];
      next[key] = color;

      if (autoGreen) {
        const paintedLetter = guesses[rowIndex]?.[cellIndex]?.toUpperCase();
        if (!paintedLetter) return next;

        if (color === "correct") {
          guesses.forEach((g, r) => {
            if (r === rowIndex) return;
            if (g[cellIndex]?.toUpperCase() === paintedLetter) {
              const k = `${r}-${cellIndex}`;
              if (!next[k]) next[k] = "correct";
            }
          });
        } else if (prevColor === "correct") {
          guesses.forEach((g, r) => {
            if (r === rowIndex) return;
            if (g[cellIndex]?.toUpperCase() === paintedLetter) {
              const k = `${r}-${cellIndex}`;
              if (next[k] === "correct") delete next[k];
            }
          });
        }
      }

      return next;
    });
  };

  const onRowReset = (rowIndex: number) => {
    setCellColors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (key.startsWith(`${rowIndex}-`) && next[key] !== "auto-absent") {
          delete next[key];
        }
      });
      return next;
    });
  };

  const onFullReset = () => {
    setCellColors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] !== "auto-absent") delete next[k];
      });
      return next;
    });
  };

  const handleSetAutoGray = (value: boolean) => {
    setAutoGray(value);
    if (!value) {
      setAutoGrayLetters(new Set());
      setCellColors((prev) => {
        const next = { ...prev };
        Object.keys(next).forEach((k) => {
          if (next[k] === "auto-absent") delete next[k];
        });
        return next;
      });
    }
  };

  const handleSetAutoGreen = (value: boolean) => {
    setAutoGreen(value);
  };

  const clearCurrentRowClass = () => setCurrentRowClass("");

  useEffect(() => {
    saveSettingsToLocalStorage({
      wordLength,
      showGrayCount,
      hardMode,
      autoGray,
      autoGreen,
    });
  }, [wordLength, showGrayCount, hardMode, autoGray, autoGreen]);

  useEffect(() => {
    if (solution)
      saveGameStateToLocalStorage({
        guesses,
        solution,
        cellColors,
        autoGrayLetters: Array.from(autoGrayLetters),
      });
  }, [guesses, cellColors, autoGrayLetters]);

  useEffect(() => {
    if (isGameWon) {
      const winMessage =
        WIN_MESSAGES[Math.floor(Math.random() * WIN_MESSAGES.length)];
      const delayMs = REVEAL_TIME_MS * solution.length;
      showSuccessAlert(winMessage, {
        delayMs,
        onClose: () => setIsStatsModalOpen(true),
      });
    }
    if (isGameLost) {
      setTimeout(
        () => setIsStatsModalOpen(true),
        (solution.length + 1) * REVEAL_TIME_MS
      );
    }
  }, [isGameWon, isGameLost, showSuccessAlert]);

  const onChar = (value: string) => {
    if (
      unicodeLength(`${currentGuess}${value}`) <= solution.length &&
      guesses.length < maxChallenges &&
      !isGameWon
    ) {
      setCurrentGuess(`${currentGuess}${value}`);
    }
  };

  const onDelete = () => {
    setCurrentGuess(currentGuess.slice(0, -1));
  };

  const onEnter = () => {
    if (isGameWon || isGameLost) return;

    if (!(unicodeLength(currentGuess) === solution.length)) {
      setCurrentRowClass("jiggle");
      return showErrorAlert(NOT_ENOUGH_LETTERS_MESSAGE, {
        onClose: clearCurrentRowClass,
      });
    }

    if (!isWordInWordList(currentGuess, hardMode)) {
      setCurrentRowClass("jiggle");
      return showErrorAlert(WORD_NOT_FOUND_MESSAGE, {
        onClose: clearCurrentRowClass,
      });
    }

    setIsRevealing(true);
    setTimeout(() => setIsRevealing(false), REVEAL_TIME_MS * solution.length);

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

        if (hardMode) {
          setHardStats(
            addStatsForCompletedGame(
              hardStats,
              guesses.length,
              maxChallenges,
              true
            )
          );
        } else {
          setStats(
            addStatsForCompletedGame(
              stats,
              guesses.length,
              maxChallenges,
              false
            )
          );
        }
        return setIsGameWon(true);
      }

      if (guesses.length === maxChallenges - 1) {
        if (hardMode) {
          setHardStats(
            addStatsForCompletedGame(
              hardStats,
              guesses.length + 1,
              maxChallenges,
              true
            )
          );
        } else {
          setStats(
            addStatsForCompletedGame(
              stats,
              guesses.length + 1,
              maxChallenges,
              false
            )
          );
        }
        setIsGameLost(true);
        showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
          persist: true,
          delayMs: REVEAL_TIME_MS * solution.length + 1,
        });
      }
    }
  };

  const bgGrid = (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(90deg, rgba(255,215,0,0.03) 1px, transparent 1px),
          linear-gradient(rgba(255,215,0,0.03) 1px, transparent 1px)
        `,
        backgroundSize: "16px 16px",
      }}
    />
  );

  if (isLoading) {
    return (
      <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
        {bgGrid}
        <Navbar
          setIsInfoModalOpen={() => {}}
          setIsStatsModalOpen={() => {}}
          setIsSettingsModalOpen={() => {}}
          handleNewGame={() => {}}
          hasActiveGame={false}
        />
        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-pixel text-center text-4xl text-crown-gold crown-glow tracking-widest"
          >
            VAGUDLE
          </motion.p>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex gap-1.5">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2"
                  style={{ background: "#d4af37" }}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </div>
            <p className="font-pixel text-xs text-crown-amber tracking-widest">
              LOADING WORDS...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      {bgGrid}
      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        handleNewGame={handleNewGameWithFail}
        hasActiveGame={hasActiveGame}
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
        />
        <InfoModal
          isOpen={isInfoModalOpen}
          handleClose={() => setIsInfoModalOpen(false)}
        />
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
            if (guesses.length === 0) {
              setSolution(getRandomWord(wordLength, value));
            }
          }}
          autoGray={autoGray}
          setAutoGray={handleSetAutoGray}
          autoGreen={autoGreen}
          setAutoGreen={handleSetAutoGreen}
        />
        <AlertContainer />
      </div>
    </div>
  );
}

export default App;