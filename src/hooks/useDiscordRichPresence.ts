import { useEffect } from "react";
import type { GameMode } from "../lib/gameMode";
import { isDiscordActivity, setDiscordActivity } from "../lib/discord";

type Params = {
  gameMode: GameMode;
  guessCount: number;
  maxGuesses: number;
  isGameWon: boolean;
  isGameLost: boolean;
};

const MODE_LABELS: Record<GameMode, string> = {
  daily: "Daily Challenge",
  duel: "Duel",
  challenge: "Custom Challenge",
  normal: "Playing Vagudle",
};

const RICH_PRESENCE_LARGE_IMAGE = "sprinkles";

export const useDiscordRichPresence = ({
  gameMode,
  guessCount,
  maxGuesses,
  isGameWon,
  isGameLost,
}: Params): void => {
  useEffect(() => {
    if (!isDiscordActivity) return;

    const details = MODE_LABELS[gameMode];
    const state = isGameWon
      ? "Solved it!"
      : isGameLost
        ? "Out of guesses"
        : `Guess ${Math.min(guessCount + 1, maxGuesses)}/${maxGuesses}`;

    void setDiscordActivity({
      details,
      state,
      largeImage: RICH_PRESENCE_LARGE_IMAGE,
      largeText: "Vagudle",
    });
  }, [gameMode, guessCount, maxGuesses, isGameWon, isGameLost]);
};
