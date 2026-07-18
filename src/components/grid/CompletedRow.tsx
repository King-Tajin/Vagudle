import { getGuessStatuses, type CharStatus } from "../../lib/statuses";
import { Cell } from "./Cell";
import { unicodeSplit } from "../../lib/words";
import RecycleIcon from "@/assets/icons/recycle.svg?react";

type Props = {
  solution: string;
  guess: string;
  rowIndex: number;
  isRevealing?: boolean;
  showGrayCount?: boolean;
  cellSize?: number;
  cellColors: { [key: string]: CharStatus };
  onRowReset: (rowIndex: number) => void;
};

export const CompletedRow = ({
  solution,
  guess,
  rowIndex,
  isRevealing,
  showGrayCount,
  cellSize = 56,
  cellColors,
  onRowReset,
}: Props) => {
  const statuses = getGuessStatuses(solution, guess);
  const splitGuess = unicodeSplit(guess);

  const greenCount = statuses.filter((s) => s === "correct").length;
  const yellowCount = statuses.filter((s) => s === "present").length;
  const grayCount = statuses.filter((s) => s === "absent").length;

  const badgeSize = Math.max(18, Math.min(28, Math.round(cellSize * 0.5)));
  const badgeFontSize = Math.max(10, Math.round(badgeSize * 0.55));
  const recycleSize = Math.max(18, Math.min(28, Math.round(cellSize * 0.5)));

  return (
    <div className="flex justify-center items-center mb-1">
      <div className="relative">
        <div className="absolute top-0 right-full mr-2 flex items-center h-full">
          <button
            type="button"
            onClick={() => onRowReset(rowIndex)}
            className="flex items-center justify-center opacity-50 hover:opacity-100 transition-opacity"
            style={{ width: recycleSize, height: recycleSize }}
            aria-label="Reset row colors"
          >
            <RecycleIcon className="w-full h-full text-gray-400" />
          </button>
        </div>

        <div className="flex">
          {splitGuess.map((letter, i) => (
            <Cell
              key={`${rowIndex}-${i}`}
              value={letter}
              status={cellColors[`${rowIndex}-${i}`]}
              position={i}
              isRevealing={isRevealing}
              isCompleted
              cellSize={cellSize}
              dataRow={rowIndex}
              dataCell={i}
            />
          ))}
        </div>

        <div className="absolute top-0 left-full ml-2 flex items-center gap-0.5 h-full">
          <div
            className="border-solid border-2 flex items-center justify-center font-bold rounded text-white bg-green-500 border-green-500"
            style={{
              width: badgeSize,
              height: badgeSize,
              fontSize: badgeFontSize,
            }}
          >
            {greenCount}
          </div>
          <div
            className="border-solid border-2 flex items-center justify-center font-bold rounded text-white bg-yellow-500 border-yellow-500"
            style={{
              width: badgeSize,
              height: badgeSize,
              fontSize: badgeFontSize,
            }}
          >
            {yellowCount}
          </div>
          {showGrayCount && (
            <div
              className="border-solid border-2 flex items-center justify-center font-bold rounded text-white bg-slate-400 border-slate-400 dark:bg-slate-700 dark:border-slate-700"
              style={{
                width: badgeSize,
                height: badgeSize,
                fontSize: badgeFontSize,
              }}
            >
              {grayCount}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
