import React, { useState, useEffect } from "react";
import type { CharStatus } from "../lib/statuses";
import { computeFullyGrayLetters } from "../lib/rowAnalysis";
import { loadGameStateFromLocalStorage } from "../lib/localStorage";

type Params = {
  guesses: string[];
  solution: string;
  autoGray: boolean;
  autoGreen: boolean;
};

type Return = {
  cellColors: { [key: string]: CharStatus };
  setCellColors: React.Dispatch<
    React.SetStateAction<{ [key: string]: CharStatus }>
  >;
  autoGrayLetters: Set<string>;
  setAutoGrayLetters: React.Dispatch<React.SetStateAction<Set<string>>>;
  onCellPaint: (rowIndex: number, cellIndex: number, color: CharStatus) => void;
  onRowReset: (rowIndex: number) => void;
  onFullReset: () => void;
  clearAutoGray: () => void;
};

export const useTilePainting = ({
  guesses,
  solution,
  autoGray,
  autoGreen,
}: Params): Return => {
  const [cellColors, setCellColors] = useState<{ [key: string]: CharStatus }>(
    () => (loadGameStateFromLocalStorage()?.cellColors as any) || {}
  );
  const [autoGrayLetters, setAutoGrayLetters] = useState<Set<string>>(
    () =>
      new Set(
        (loadGameStateFromLocalStorage()?.autoGrayLetters ?? []) as string[]
      )
  );

  useEffect(() => {
    if (!autoGray) return;

    const fullyGrayLetters = computeFullyGrayLetters(solution, guesses);

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
  }, [autoGray, guesses, solution]);

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

  const clearAutoGray = () => {
    setAutoGrayLetters(new Set());
    setCellColors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (next[k] === "auto-absent") delete next[k];
      });
      return next;
    });
  };

  return {
    cellColors,
    setCellColors,
    autoGrayLetters,
    setAutoGrayLetters,
    onCellPaint,
    onRowReset,
    onFullReset,
    clearAutoGray,
  };
};
