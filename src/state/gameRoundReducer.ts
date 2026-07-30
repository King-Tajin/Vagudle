import type React from "react";
import type { CharStatus } from "../lib/statuses";

export type GameRoundState = {
  solution: string;
  guesses: string[];
  cellColors: { [key: string]: CharStatus };
  currentGuess: string;
  currentRowClass: string;
  isGameWon: boolean;
  isGameLost: boolean;
  isRevealing: boolean;
  isCelebrating: boolean;
};

export type GameRoundAction =
  | { field: "solution"; value: React.SetStateAction<string> }
  | { field: "guesses"; value: React.SetStateAction<string[]> }
  | {
      field: "cellColors";
      value: React.SetStateAction<{ [key: string]: CharStatus }>;
    }
  | { field: "currentGuess"; value: React.SetStateAction<string> }
  | { field: "currentRowClass"; value: React.SetStateAction<string> }
  | { field: "isGameWon"; value: React.SetStateAction<boolean> }
  | { field: "isGameLost"; value: React.SetStateAction<boolean> }
  | { field: "isRevealing"; value: React.SetStateAction<boolean> }
  | { field: "isCelebrating"; value: React.SetStateAction<boolean> };

function applyGameRoundField<K extends keyof GameRoundState>(
  state: GameRoundState,
  field: K,
  value: React.SetStateAction<GameRoundState[K]>
): GameRoundState {
  const nextValue = typeof value === "function" ? value(state[field]) : value;
  return Object.is(nextValue, state[field])
    ? state
    : { ...state, [field]: nextValue };
}

export function gameRoundReducer(
  state: GameRoundState,
  action: GameRoundAction
): GameRoundState {
  switch (action.field) {
    case "solution":
      return applyGameRoundField(state, "solution", action.value);
    case "guesses":
      return applyGameRoundField(state, "guesses", action.value);
    case "cellColors":
      return applyGameRoundField(state, "cellColors", action.value);
    case "currentGuess":
      return applyGameRoundField(state, "currentGuess", action.value);
    case "currentRowClass":
      return applyGameRoundField(state, "currentRowClass", action.value);
    case "isGameWon":
      return applyGameRoundField(state, "isGameWon", action.value);
    case "isGameLost":
      return applyGameRoundField(state, "isGameLost", action.value);
    case "isRevealing":
      return applyGameRoundField(state, "isRevealing", action.value);
    case "isCelebrating":
      return applyGameRoundField(state, "isCelebrating", action.value);
  }
}
