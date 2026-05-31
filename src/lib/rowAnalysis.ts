import { getGuessStatuses } from "./statuses";

export const isRowFullyGray = (solution: string, guess: string): boolean => {
  if (!guess) return false;
  const statuses = getGuessStatuses(solution, guess);
  return statuses.every((s) => s === "absent");
};

export const computeFullyGrayLetters = (
  solution: string,
  guesses: string[]
): Set<string> => {
  const letters = new Set<string>();
  guesses.forEach((guess) => {
    if (isRowFullyGray(solution, guess)) {
      guess.split("").forEach((ch) => letters.add(ch.toUpperCase()));
    }
  });
  return letters;
};
