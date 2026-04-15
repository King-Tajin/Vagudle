import React, { useEffect, useRef, useState } from "react";
import { MAX_CHALLENGES } from "../../constants/settings";
import { CharStatus } from "../../lib/statuses";
import { CompletedRow } from "./CompletedRow";
import { CurrentRow, EmptyRow } from "./GridRows";
import GreenBrushIcon from "@/assets/icons/green-brush.svg?react";
import YellowBrushIcon from "@/assets/icons/yellow-brush.svg?react";
import GrayBrushIcon from "@/assets/icons/gray-brush.svg?react";
import RecycleIcon from "@/assets/icons/recycle.svg?react";

type Props = {
  solution: string;
  guesses: string[];
  currentGuess: string;
  isRevealing?: boolean;
  currentRowClassName: string;
  showGrayCount?: boolean;
  maxChallenges?: number;
  cellColors: { [key: string]: CharStatus };
  onCellPaint: (rowIndex: number, cellIndex: number, color: CharStatus) => void;
  onRowReset: (rowIndex: number) => void;
  onFullReset: () => void;
  autoGray?: boolean;
};

const computeCellSize = (solutionLength: number, showGrayCount?: boolean) => {
  if (typeof window === "undefined") return 56;
  const badgeCount = showGrayCount ? 3 : 2;
  const subtract = 16 + (badgeCount - 1) * 4 + 36;
  const size = Math.floor(
    (window.innerWidth - subtract - solutionLength * 4) /
      (solutionLength + badgeCount)
  );
  return Math.min(56, Math.max(20, size));
};

const useCellSize = (solutionLength: number, showGrayCount?: boolean) => {
  const [cellSize, setCellSize] = useState(() =>
    computeCellSize(solutionLength, showGrayCount)
  );
  useEffect(() => {
    const compute = () =>
      setCellSize(computeCellSize(solutionLength, showGrayCount));
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, [solutionLength, showGrayCount]);
  return cellSize;
};

const BRUSHES: {
  status: CharStatus;
  Icon: React.ComponentType<any>;
  border: string;
  bg: string;
}[] = [
  {
    status: "correct",
    Icon: GreenBrushIcon,
    border: "#22c55e",
    bg: "rgba(34,197,94,0.2)",
  },
  {
    status: "present",
    Icon: YellowBrushIcon,
    border: "#eab308",
    bg: "rgba(234,179,8,0.2)",
  },
  {
    status: "absent",
    Icon: GrayBrushIcon,
    border: "#64748b",
    bg: "rgba(100,116,139,0.2)",
  },
];

const paintFromPoint = (
  x: number,
  y: number,
  selectedBrush: CharStatus,
  onCellPaint: (r: number, c: number, color: CharStatus) => void
) => {
  const el = document.elementFromPoint(x, y);
  const cell = el?.closest("[data-row]") as HTMLElement | null;
  if (!cell) return;
  const r = parseInt(cell.dataset.row ?? "");
  const c = parseInt(cell.dataset.cell ?? "");
  if (!isNaN(r) && !isNaN(c)) onCellPaint(r, c, selectedBrush);
};

export const Grid = ({
  solution,
  guesses,
  currentGuess,
  isRevealing,
  currentRowClassName,
  showGrayCount,
  maxChallenges = MAX_CHALLENGES,
  cellColors,
  onCellPaint,
  onRowReset,
  onFullReset,
  autoGray,
}: Props) => {
  const cellSize = useCellSize(solution.length, showGrayCount);
  const [selectedBrush, setSelectedBrush] = useState<CharStatus | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const isPainting = useRef(false);
  const selectedBrushRef = useRef<CharStatus | null>(null);
  const completedRowsRef = useRef<HTMLDivElement>(null);
  selectedBrushRef.current = selectedBrush;

  useEffect(() => {
    const stop = () => { isPainting.current = false; };
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchend", stop);
    return () => {
      window.removeEventListener("mouseup", stop);
      window.removeEventListener("touchend", stop);
    };
  }, []);

  useEffect(() => {
    const el = completedRowsRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (!selectedBrushRef.current) return;
      const t = e.touches[0];
      const hit = document.elementFromPoint(t.clientX, t.clientY);
      if (!hit?.closest("[data-row]")) return;
      e.preventDefault();
      isPainting.current = true;
      paintFromPoint(t.clientX, t.clientY, selectedBrushRef.current, onCellPaint);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isPainting.current || !selectedBrushRef.current) return;
      e.preventDefault();
      const t = e.touches[0];
      paintFromPoint(t.clientX, t.clientY, selectedBrushRef.current, onCellPaint);
    };

    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [onCellPaint]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!selectedBrushRef.current) return;
    e.preventDefault();
    isPainting.current = true;
    paintFromPoint(e.clientX, e.clientY, selectedBrushRef.current, onCellPaint);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPainting.current || !selectedBrushRef.current) return;
    paintFromPoint(e.clientX, e.clientY, selectedBrushRef.current, onCellPaint);
  };

  const empties =
    guesses.length < maxChallenges - 1
      ? Array.from(Array(maxChallenges - 1 - guesses.length))
      : [];

  return (
    <>
      {guesses.length > 0 && (
        <>
          <div className="flex justify-center items-center gap-3 mb-3">
            {BRUSHES.map(({ status, Icon, border, bg }) => (
              <button
                key={status}
                onClick={() =>
                  setSelectedBrush(selectedBrush === status ? null : status)
                }
                className="flex items-center justify-center rounded transition-all"
                style={{
                  width: 52,
                  height: 52,
                  border: `2px solid ${
                    selectedBrush === status ? border : "rgba(255,255,255,0.15)"
                  }`,
                  background: selectedBrush === status ? bg : "transparent",
                }}
                aria-label={`${status} brush`}
              >
                <Icon className="w-9 h-9" />
              </button>
            ))}
            <div
              style={{
                width: 1,
                height: 32,
                background: "rgba(255,255,255,0.12)",
                flexShrink: 0,
              }}
            />
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center justify-center rounded transition-all"
              style={{
                width: 52,
                height: 52,
                border: "2px solid rgba(255,255,255,0.15)",
                background: "transparent",
              }}
              aria-label="Reset all colors"
            >
              <RecycleIcon className="w-9 h-9 text-gray-400" />
            </button>
          </div>

          {showResetConfirm && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center"
              style={{ background: "rgba(0,0,0,0.7)" }}
            >
              <div
                className="mx-4 p-5 max-w-sm w-full"
                style={{
                  background: "#111",
                  border: "2px solid rgba(255,215,0,0.4)",
                }}
              >
                <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
                  RESET ALL COLORS?
                </p>
                <p className="font-code text-sm text-gray-300 mb-5">
                  {autoGray
                    ? "This will clear all painted cells. Auto-grayed cells will remain."
                    : "This will clear all painted cells."}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowResetConfirm(false);
                      onFullReset();
                    }}
                    className="flex-1 py-2 font-pixel text-xs tracking-widest transition-colors"
                    style={{
                      background: "rgba(220,50,50,0.15)",
                      border: "1px solid rgba(220,50,50,0.5)",
                      color: "#f87171",
                    }}
                  >
                    RESET
                  </button>
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="flex-1 py-2 font-pixel text-xs tracking-widest transition-colors"
                    style={{
                      background: "rgba(255,215,0,0.08)",
                      border: "1px solid rgba(255,215,0,0.3)",
                      color: "#fbbf24",
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div
        ref={completedRowsRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        style={{ userSelect: "none" }}
      >
        {guesses.map((guess, i) => (
          <CompletedRow
            key={i}
            rowIndex={i}
            solution={solution}
            guess={guess}
            isRevealing={isRevealing && guesses.length - 1 === i}
            showGrayCount={showGrayCount}
            cellSize={cellSize}
            cellColors={cellColors}
            onRowReset={onRowReset}
          />
        ))}
      </div>
      <div>
        {guesses.length < maxChallenges && (
          <CurrentRow
            guess={currentGuess}
            className={currentRowClassName}
            solutionLength={solution.length}
            cellSize={cellSize}
          />
        )}
        {empties.map((_, i) => (
          <EmptyRow
            key={i}
            solutionLength={solution.length}
            cellSize={cellSize}
          />
        ))}
      </div>
    </>
  );
};