import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { BookOpen, Hash, Target } from "lucide-react";
import { Grid } from "./components/grid/Grid";
import { Keyboard } from "./components/keyboard/Keyboard";
import { InfoModal } from "./components/modals/InfoModal";
import { StatsModal } from "./components/modals/StatsModal";
import { SettingsModal } from "./components/modals/SettingsModal";
import { ChallengeAcceptModal } from "./components/modals/ChallengeAcceptModal";
import {
  WIN_MESSAGES,
  CHALLENGE_WIN_MESSAGES,
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
  isWordInDict,
  isWinningWord,
  unicodeLength,
  getRandomWord,
} from "./lib/words";
import {
  CharStatus,
  getStatusesFromCellColors,
  getGuessStatuses,
} from "./lib/statuses";
import {
  addStatsForCompletedGame,
  loadStats,
  saveStatsToLocalStorage,
} from "./lib/stats";
import {
  loadGameStateFromLocalStorage,
  saveGameStateToLocalStorage,
  loadSettingsFromLocalStorage,
  saveSettingsToLocalStorage,
} from "./lib/localStorage";
import {
  decodeChallenge,
  loadChallengeState,
  saveChallengeState,
  pruneOldChallengeStates,
  DICT_LABELS,
  type ChallengeConfig,
} from "./lib/challenge";
import { AlertContainer } from "./components/Alert";
import { useAlert } from "./context/AlertContext";
import { Navbar } from "./components/Navbar";
import { isInAppBrowser } from "./lib/browser";
import { WinCelebration } from "./components/WinCelebration";

const challengeParam = new URLSearchParams(window.location.search).get(
  "challenge"
);

const isRowFullyGray = (solution: string, guess: string): boolean => {
  if (!guess) return false;
  const statuses = getGuessStatuses(solution, guess);
  return statuses.every((s) => s === "absent");
};

interface TajinParticle {
  id: number;
  startX: number;
  delay: number;
  duration: number;
  type: "chili" | "lime" | "salt";
}

interface StripMeasure {
  leftWidth: number;
  rightStart: number;
  rightWidth: number;
}

function TajinRain({
  keyboardRef,
}: {
  keyboardRef: React.RefObject<HTMLDivElement>;
}) {
  const [strips, setStrips] = useState<StripMeasure>({
    leftWidth: 0,
    rightStart: 0,
    rightWidth: 0,
  });
  const [viewportH, setViewportH] = useState(() => window.innerHeight);
  const [particles, setParticles] = useState<TajinParticle[]>([]);

  useEffect(() => {
    const measure = () => {
      const el = keyboardRef.current;
      if (!el) return;
      const buttons = el.querySelectorAll("button");
      if (buttons.length === 0) return;

      let minLeft = Infinity;
      let maxRight = -Infinity;
      buttons.forEach((btn) => {
        const label = btn.getAttribute("aria-label") ?? "";
        const isSpecial =
          label.toLowerCase().startsWith("enter") ||
          label.toLowerCase().startsWith("delete");
        if (isSpecial) return;
        const r = btn.getBoundingClientRect();
        if (r.left < minLeft) minLeft = r.left;
        if (r.right > maxRight) maxRight = r.right;
      });

      if (minLeft === Infinity || maxRight === -Infinity) return;

      const vw = window.innerWidth;
      const leftWidth = Math.max(0, minLeft - 8);
      const rightStart = maxRight + 8;
      const rightWidth = Math.max(0, vw - rightStart);

      setViewportH(window.innerHeight);
      setStrips((prev) => {
        if (
          Math.abs(prev.leftWidth - leftWidth) < 1 &&
          Math.abs(prev.rightStart - rightStart) < 1 &&
          Math.abs(prev.rightWidth - rightWidth) < 1
        )
          return prev;
        return { leftWidth, rightStart, rightWidth };
      });
    };

    requestAnimationFrame(measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [keyboardRef]);

  useEffect(() => {
    const COUNT = 45;
    const EXP = 2.8;
    const next: TajinParticle[] = [];
    let id = 0;

    const makeParticle = (x: number): TajinParticle => ({
      id: id++,
      startX: x,
      delay: Math.random() * 6,
      duration: 3 + Math.random() * 4,
      type: (["chili", "lime", "salt"] as const)[Math.floor(Math.random() * 3)],
    });

    if (strips.leftWidth > 2) {
      for (let i = 0; i < COUNT; i++) {
        next.push(
          makeParticle(Math.pow(Math.random(), EXP) * strips.leftWidth)
        );
      }
    }

    if (strips.rightWidth > 2) {
      for (let i = 0; i < COUNT; i++) {
        next.push(
          makeParticle(
            strips.rightStart +
              (1 - Math.pow(Math.random(), EXP)) * strips.rightWidth
          )
        );
      }
    }

    setParticles(next);
  }, [strips, viewportH]);

  const getColor = (type: string) => {
    switch (type) {
      case "chili":
        return "#C41E3A";
      case "lime":
        return "#A4C639";
      default:
        return "#FFD700";
    }
  };

  if (particles.length === 0) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {particles.map((p) => (
        <motion.div
          key={p.id}
          style={{
            position: "absolute",
            left: p.startX,
            top: -8,
            width: 8,
            height: 8,
            background: getColor(p.type),
          }}
          animate={{
            y: ["0px", `${viewportH + 20}px`],
            rotate: [0, 360],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

function App() {
  const {
    showError: showErrorAlert,
    showSuccess: showSuccessAlert,
    dismiss: dismissAlert,
  } = useAlert();

  const [isLoading, setIsLoading] = useState(true);
  const [wordLength, setWordLength] = useState(
    () => loadSettingsFromLocalStorage().wordLength
  );
  const [hardMode, setHardMode] = useState(
    () => loadSettingsFromLocalStorage().hardMode
  );
  const [solution, setSolution] = useState(
    () => loadGameStateFromLocalStorage()?.solution ?? ""
  );
  const [challengeConfig, setChallengeConfig] =
    useState<ChallengeConfig | null>(null);
  const [isMalformedChallenge, setIsMalformedChallenge] = useState(false);
  const [currentGuess, setCurrentGuess] = useState("");
  const [isGameWon, setIsGameWon] = useState(false);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
  const [currentRowClass, setCurrentRowClass] = useState("");
  const [isGameLost, setIsGameLost] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [showGrayCount, setShowGrayCount] = useState(
    () => loadSettingsFromLocalStorage().showGrayCount
  );
  const [autoGray, setAutoGray] = useState(
    () => loadSettingsFromLocalStorage().autoGray ?? false
  );
  const [autoGrayLetters, setAutoGrayLetters] = useState<Set<string>>(
    () =>
      new Set(
        (loadGameStateFromLocalStorage()?.autoGrayLetters ?? []) as string[]
      )
  );
  const [autoGreen, setAutoGreen] = useState(
    () => loadSettingsFromLocalStorage().autoGreen ?? false
  );
  const [winCelebration, setWinCelebration] = useState(
    () => loadSettingsFromLocalStorage().winCelebration ?? true
  );
  const [isCelebrating, setIsCelebrating] = useState(false);
  const [guesses, setGuesses] = useState<string[]>(
    () => loadGameStateFromLocalStorage()?.guesses ?? []
  );
  const [cellColors, setCellColors] = useState<{ [key: string]: CharStatus }>(
    () => (loadGameStateFromLocalStorage()?.cellColors as any) || {}
  );
  const [stats, setStats] = useState(() => loadStats(false));
  const [hardStats, setHardStats] = useState(() => loadStats(true));

  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restoredGameRef = useRef(false);
  const keyboardRef = useRef<HTMLDivElement>(null);

  const isChallengeMode = challengeConfig !== null;

  const maxChallenges = challengeConfig
    ? challengeConfig.guesses
    : hardMode
    ? HARD_MODE_MAX_CHALLENGES
    : NORMAL_MODE_MAX_CHALLENGES;

  const userStatuses = getStatusesFromCellColors(guesses, cellColors);

  const recordStats = (count: number) => {
    if (hardMode) {
      const updated = addStatsForCompletedGame(hardStats, count, maxChallenges);
      saveStatsToLocalStorage(updated, true);
      setHardStats(updated);
    } else {
      const updated = addStatsForCompletedGame(stats, count, maxChallenges);
      saveStatsToLocalStorage(updated, false);
      setStats(updated);
    }
  };

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    document.title = isChallengeMode ? "Vagudle - Challenge" : "Vagudle";
    return () => {
      document.title = "Vagudle";
    };
  }, [isChallengeMode]);

  useEffect(() => {
    const run = async () => {
      pruneOldChallengeStates();
      const loadStart = Date.now();
      const savedSettings = loadSettingsFromLocalStorage();
      const savedState = loadGameStateFromLocalStorage();
      await initWordLists();

      if (challengeParam) {
        const config = await decodeChallenge(challengeParam);
        if (!config) {
          setIsMalformedChallenge(true);
          setIsLoading(false);
          return;
        }

        const wordUpper = config.word.toUpperCase();
        if (!isWordInDict(wordUpper, config.dict)) {
          setIsMalformedChallenge(true);
          setIsLoading(false);
          return;
        }

        setChallengeConfig(config);
        setSolution(wordUpper);

        const savedChallenge = loadChallengeState(config.id);
        let alreadyFinished = false;
        if (savedChallenge) {
          setGuesses(savedChallenge.guesses);
          setCellColors(savedChallenge.cellColors as any);
          setAutoGrayLetters(new Set(savedChallenge.autoGrayLetters));
          const won = savedChallenge.guesses.some(
            (g) => g.toUpperCase() === wordUpper
          );
          const lost = !won && savedChallenge.guesses.length >= config.guesses;
          if (won) {
            restoredGameRef.current = true;
            setIsGameWon(true);
          } else if (lost) {
            restoredGameRef.current = true;
            setIsGameLost(true);
          }
          alreadyFinished = won || lost;
        } else {
          setGuesses([]);
          setCellColors({});
          setAutoGrayLetters(new Set());
        }
        setIsChallengeModalOpen(!alreadyFinished);
        setIsLoading(false);
        return;
      }

      const elapsed = Date.now() - loadStart;
      const remaining = Math.max(0, 500 - elapsed);
      await new Promise((r) => setTimeout(r, remaining));

      if (savedState) {
        const gameWasWon = savedState.guesses.some(
          (g) => g.toUpperCase() === savedState.solution.toUpperCase()
        );
        const savedHardMode = savedState.hardMode ?? savedSettings.hardMode;
        const savedMaxChallenges = savedHardMode
          ? HARD_MODE_MAX_CHALLENGES
          : NORMAL_MODE_MAX_CHALLENGES;
        setSolution(savedState.solution);
        setGuesses(savedState.guesses);
        setCellColors((savedState.cellColors as any) ?? {});
        setAutoGrayLetters(
          new Set((savedState.autoGrayLetters ?? []) as string[])
        );
        if (gameWasWon) {
          restoredGameRef.current = true;
          setIsGameWon(true);
        } else if (savedState.guesses.length >= savedMaxChallenges) {
          restoredGameRef.current = true;
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
        setGuesses([]);
        setCellColors({});
        setAutoGrayLetters(new Set());
        setTimeout(() => setIsInfoModalOpen(true), WELCOME_INFO_MODAL_MS);
      }
      setIsLoading(false);
    };
    void run();
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
          if (
            fullyGrayLetters.has(ch.toUpperCase()) &&
            next[key] !== "auto-absent"
          ) {
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
    if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
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

  const handleReturnToNormal = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  const handleNewGameWithFail = () => {
    if (isChallengeMode) {
      handleReturnToNormal();
      return;
    }
    if (hasActiveGame) {
      recordStats(maxChallenges);
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

  const clearCurrentRowClass = () => setCurrentRowClass("");

  useEffect(() => {
    if (!isChallengeMode) {
      saveSettingsToLocalStorage({
        wordLength,
        showGrayCount,
        hardMode,
        autoGray,
        autoGreen,
        winCelebration,
      });
    }
  }, [
    wordLength,
    showGrayCount,
    hardMode,
    autoGray,
    autoGreen,
    winCelebration,
  ]);

  useEffect(() => {
    if (!solution) return;
    if (isChallengeMode && challengeConfig) {
      saveChallengeState(challengeConfig.id, {
        guesses,
        cellColors,
        autoGrayLetters: Array.from(autoGrayLetters),
      });
    } else {
      saveGameStateToLocalStorage({
        guesses,
        solution,
        cellColors,
        autoGrayLetters: Array.from(autoGrayLetters),
        hardMode,
      });
    }
  }, [
    guesses,
    cellColors,
    autoGrayLetters,
    isChallengeMode,
    challengeConfig,
    solution,
    hardMode,
  ]);

  useEffect(() => {
    if (isGameWon) {
      if (restoredGameRef.current) {
        restoredGameRef.current = false;
        return;
      }
      const delayMs = REVEAL_TIME_MS * solution.length;
      if (winCelebration) {
        setTimeout(() => setIsCelebrating(true), Math.max(delayMs, 3000));
      } else {
        const pool = isChallengeMode ? CHALLENGE_WIN_MESSAGES : WIN_MESSAGES;
        const winMessage = pool[Math.floor(Math.random() * pool.length)];
        showSuccessAlert(winMessage, {
          delayMs,
          onClose: () => setIsStatsModalOpen(true),
        });
      }
    }
    if (isGameLost) {
      if (restoredGameRef.current) {
        restoredGameRef.current = false;
        return;
      }
      setTimeout(
        () => setIsStatsModalOpen(true),
        (solution.length + 1) * REVEAL_TIME_MS
      );
    }
  }, [
    isGameWon,
    isGameLost,
    showSuccessAlert,
    solution,
    isChallengeMode,
    winCelebration,
  ]);

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

        if (!isChallengeMode) recordStats(guesses.length);
        return setIsGameWon(true);
      }

      if (guesses.length === maxChallenges - 1) {
        if (!isChallengeMode) recordStats(guesses.length + 1);
        setIsGameLost(true);
        if (!isChallengeMode) {
          showErrorAlert(CORRECT_WORD_MESSAGE(solution), {
            persist: true,
            delayMs: REVEAL_TIME_MS * solution.length + 1,
          });
        }
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
          isInfoModalOpen={false}
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

  if (isMalformedChallenge) {
    return (
      <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
        {bgGrid}
        <Navbar
          setIsInfoModalOpen={() => {}}
          setIsStatsModalOpen={() => {}}
          setIsSettingsModalOpen={() => {}}
          handleNewGame={() => {}}
          hasActiveGame={false}
          isInfoModalOpen={false}
        />
        <div className="flex flex-col items-center justify-center flex-1 gap-4 px-6">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-pixel text-center text-4xl text-crown-gold crown-glow tracking-widest"
          >
            VAGUDLE
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="max-w-sm w-full p-5 text-center"
            style={{
              background: "rgba(220,50,50,0.08)",
              border: "2px solid rgba(220,50,50,0.4)",
            }}
          >
            <p className="font-pixel text-xs text-tajin-red tracking-widest mb-2">
              INVALID CHALLENGE LINK
            </p>
            <p className="font-code text-sm text-gray-400 leading-relaxed mb-4">
              This challenge link is broken or has been tampered with. Ask the
              sender to share it again.
            </p>
            <button
              onClick={handleReturnToNormal}
              className="font-pixel text-xs tracking-widest px-4 py-2 transition-all"
              style={{
                background: "rgba(255,215,0,0.08)",
                border: "1px solid rgba(255,215,0,0.3)",
                color: "#d4af37",
              }}
            >
              PLAY NORMAL VAGUDLE
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "#0A0A0A" }}>
      {bgGrid}
      <TajinRain keyboardRef={keyboardRef} />
      <Navbar
        setIsInfoModalOpen={setIsInfoModalOpen}
        setIsStatsModalOpen={setIsStatsModalOpen}
        setIsSettingsModalOpen={setIsSettingsModalOpen}
        handleNewGame={handleNewGameWithFail}
        hasActiveGame={hasActiveGame}
        isChallengeMode={isChallengeMode}
        isInfoModalOpen={isInfoModalOpen}
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

          {isChallengeMode && challengeConfig && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mb-4 max-w-sm w-full px-4 py-2.5"
              style={{
                background: "rgba(80,0,170,0.1)",
                border: "1px solid rgba(80,0,170,0.4)",
              }}
            >
              <p className="font-pixel text-[9px] text-crown-amber tracking-widest text-center mb-1.5">
                CUSTOM CHALLENGE
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <span className="flex items-center gap-1 font-code text-xs text-gray-400">
                  <Hash className="w-3 h-3 text-crown-amber" />
                  {challengeConfig.length} letters
                </span>
                <span className="font-code text-xs text-gray-600">·</span>
                <span className="flex items-center gap-1 font-code text-xs text-gray-400">
                  <BookOpen className="w-3 h-3 text-crown-amber" />
                  {DICT_LABELS[challengeConfig.dict]} word
                </span>
                <span className="font-code text-xs text-gray-600">·</span>
                <span className="flex items-center gap-1 font-code text-xs text-gray-400">
                  <Target className="w-3 h-3 text-crown-amber" />
                  {challengeConfig.guesses} guesses
                </span>
              </div>
            </motion.div>
          )}

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
          setAutoGreen={setAutoGreen}
          winCelebration={winCelebration}
          setWinCelebration={setWinCelebration}
          challengeConfig={isChallengeMode ? challengeConfig : null}
        />
        {isChallengeMode && challengeConfig && (
          <ChallengeAcceptModal
            isOpen={isChallengeModalOpen}
            onPlay={() => setIsChallengeModalOpen(false)}
            config={challengeConfig}
          />
        )}
        <AlertContainer />
      </div>
      {isCelebrating && (
        <WinCelebration
          word={solution}
          onDone={() => {
            setIsCelebrating(false);
            setIsStatsModalOpen(true);
          }}
        />
      )}
    </div>
  );
}

export default App;
