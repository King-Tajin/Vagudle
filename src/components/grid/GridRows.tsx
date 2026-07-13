import { Cell } from "./Cell";
import { unicodeSplit } from "../../lib/words";

type CurrentRowProps = {
  guess: string;
  className: string;
  solutionLength: number;
  cellSize?: number;
};

export const CurrentRow = ({
  guess,
  className,
  solutionLength,
  cellSize = 56,
}: CurrentRowProps) => {
  const splitGuess = unicodeSplit(guess);
  const emptyCells = Array.from(Array(solutionLength - splitGuess.length));

  return (
    <div className={`flex justify-center mb-1 ${className}`}>
      {splitGuess.map((letter, i) => (
        <Cell key={`letter-${i}`} value={letter} cellSize={cellSize} />
      ))}
      {emptyCells.map((_, i) => (
        <Cell key={`empty-${i}`} cellSize={cellSize} />
      ))}
    </div>
  );
};

type EmptyRowProps = {
  solutionLength: number;
  cellSize?: number;
};

export const EmptyRow = ({ solutionLength, cellSize = 56 }: EmptyRowProps) => {
  const emptyCells = Array.from(Array(solutionLength));

  return (
    <div className="flex justify-center mb-1">
      {emptyCells.map((_, i) => (
        <Cell key={i} cellSize={cellSize} />
      ))}
    </div>
  );
};
