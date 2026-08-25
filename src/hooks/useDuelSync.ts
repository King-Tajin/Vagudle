import type React from "react";
import { useEffect, useRef } from "react";
import type { CharStatus } from "../lib/statuses";
import type { DuelConfig } from "../lib/duel";
import {
  requestDuelSyncTicket,
  requestActivityDuelSyncTicket,
  fetchServerDuelProgress,
  fetchServerActivityDuelProgress,
} from "../lib/sync";
import { useSyncSocket } from "./useSyncSocket";

type Params = {
  isDuelMode: boolean;
  duelToken: string | null;
  activityAccessToken: string | null;
  duelConfig: DuelConfig | null;
  isLoading: boolean;
  guesses: string[];
  isGameWon: boolean;
  isGameLost: boolean;
  restoredGameRef: React.RefObject<boolean>;
  setGuesses: (v: string[]) => void;
  setCellColors: (v: { [key: string]: CharStatus }) => void;
  setIsGameWon: (v: boolean) => void;
  setIsGameLost: (v: boolean) => void;
};

export const useDuelSync = ({
  isDuelMode,
  duelToken,
  activityAccessToken,
  duelConfig,
  isLoading,
  guesses,
  isGameWon,
  isGameLost,
  restoredGameRef,
  setGuesses,
  setCellColors,
  setIsGameWon,
  setIsGameLost,
}: Params): void => {
  const hasTokenPath = !!duelToken;
  const hasActivityPath = !!activityAccessToken && !!duelConfig?.id;

  const reconcileFromServerRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    reconcileFromServerRef.current = async () => {
      if (!duelConfig) return;
      const serverProgress = duelToken
        ? await fetchServerDuelProgress(duelToken)
        : activityAccessToken
          ? await fetchServerActivityDuelProgress(
              activityAccessToken,
              duelConfig.id
            )
          : null;
      if (!serverProgress) return;

      const wordUpper = duelConfig.word.toUpperCase();
      const won = serverProgress.guesses.some(
        (g) => g.toUpperCase() === wordUpper
      );
      const lost = !won && serverProgress.guesses.length >= duelConfig.guesses;

      if (won || lost) restoredGameRef.current = true;

      setGuesses(serverProgress.guesses);
      setCellColors(serverProgress.cellColors as { [key: string]: CharStatus });
      setIsGameWon(won);
      setIsGameLost(lost);
    };
  });

  const active =
    isDuelMode &&
    !isLoading &&
    !!duelConfig &&
    !isGameWon &&
    !isGameLost &&
    (hasTokenPath || hasActivityPath);

  useSyncSocket(
    active && !!duelConfig,
    () =>
      duelToken
        ? requestDuelSyncTicket(duelToken)
        : activityAccessToken && duelConfig
          ? requestActivityDuelSyncTicket(activityAccessToken, duelConfig.id)
          : Promise.resolve(null),
    () => void reconcileFromServerRef.current(),
    [duelConfig, duelToken, activityAccessToken],
    guesses
  );
};
