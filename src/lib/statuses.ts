import { unicodeSplit } from "./words";

export type CharStatus = "absent" | "present" | "correct" | "auto-absent";

export const describeLetterStatus = (
  value: string | undefined,
  status: CharStatus | undefined
): string => {
  if (!value) return "Empty";
  if (!status) return value;
  const word = status === "auto-absent" ? "absent" : status;
  return `${value}, ${word}`;
};

export const getGuessStatuses = (
  solution: string,
  guess: string
): CharStatus[] => {
  const splitSolution = unicodeSplit(solution);
  const splitGuess = unicodeSplit(guess);

  const solutionCharsTaken = splitSolution.map(() => false);
  const solutionCharSet = new Set(splitSolution);

  const statuses = new Array<CharStatus>(guess.length);

  splitGuess.forEach((letter, i) => {
    if (letter === splitSolution[i]) {
      statuses[i] = "correct";
      solutionCharsTaken[i] = true;
      return;
    }
  });

  splitGuess.forEach((letter, i) => {
    if (statuses[i]) return;

    if (!solutionCharSet.has(letter)) {
      statuses[i] = "absent";
      return;
    }

    const indexOfPresentChar = splitSolution.findIndex(
      (x, index) => x === letter && !solutionCharsTaken[index]
    );

    if (indexOfPresentChar > -1) {
      statuses[i] = "present";
      solutionCharsTaken[indexOfPresentChar] = true;
      return;
    } else {
      statuses[i] = "absent";
      return;
    }
  });

  return statuses;
};

export const getStatusesFromCellColors = (
  guesses: string[],
  cellColors: { [key: string]: CharStatus }
): { [key: string]: CharStatus } => {
  const rank: { [k in CharStatus]: number } = {
    correct: 3,
    present: 2,
    absent: 1,
    "auto-absent": 1,
  };
  const charObj: { [key: string]: CharStatus } = {};

  guesses.forEach((word, rowIndex) => {
    word.split("").forEach((letter, cellIndex) => {
      const color = cellColors[`${rowIndex}-${cellIndex}`];
      if (!color) return;
      const effectiveColor: CharStatus =
        color === "auto-absent" ? "absent" : color;
      const current = charObj[letter];
      if (!current || rank[effectiveColor] > rank[current]) {
        charObj[letter] = effectiveColor;
      }
    });
  });

  return charObj;
};
