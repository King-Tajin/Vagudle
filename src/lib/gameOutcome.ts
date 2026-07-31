export type GameOutcome = "won" | "lost" | "playing";

export const getGameOutcome = (
  isGameWon: boolean,
  isGameLost: boolean
): GameOutcome => {
  if (isGameWon) return "won";
  if (isGameLost) return "lost";
  return "playing";
};
