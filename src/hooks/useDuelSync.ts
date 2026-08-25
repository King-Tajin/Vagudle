import React, { useEffect, useRef } from "react";
import type { CharStatus } from "../lib/statuses";
import type { DuelConfig } from "../lib/duel";
import {
  requestDuelSyncTicket,
  requestActivityDuelSyncTicket,
  fetchServerDuelProgress,
  fetchServerActivityDuelProgress,
  openSyncSocket,
  notifySyncChanged,
} from "../lib/sync";

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

const RECONNECT_DELAY_MS = 1500;
const MAX_RECONNECT_ATTEMPTS = 2;

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
  const socketRef = useRef<WebSocket | null>(null);
  const sentGuessCountRef = useRef(0);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);

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

  useEffect(() => {
    if (!active || !duelConfig) return;

    let cancelled = false;
    let currentWs: WebSocket | null = null;
    let reconnectTimeoutId: ReturnType<typeof setTimeout> | undefined;
    intentionalCloseRef.current = false;
    reconnectAttemptsRef.current = 0;

    const handleOpen = () => {
      reconnectAttemptsRef.current = 0;
    };

    const handleClose = () => {
      if (socketRef.current === currentWs) socketRef.current = null;
      if (
        cancelled ||
        intentionalCloseRef.current ||
        reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS
      )
        return;
      reconnectAttemptsRef.current += 1;
      reconnectTimeoutId = setTimeout(() => {
        if (!cancelled && !intentionalCloseRef.current) void connect();
      }, RECONNECT_DELAY_MS);
    };

    const connect = async () => {
      const ticket = duelToken
        ? await requestDuelSyncTicket(duelToken)
        : activityAccessToken
          ? await requestActivityDuelSyncTicket(
              activityAccessToken,
              duelConfig.id
            )
          : null;
      if (!ticket || cancelled) return;

      const ws = openSyncSocket(ticket, () => {
        void reconcileFromServerRef.current();
      });
      currentWs = ws;
      socketRef.current = ws;

      ws.addEventListener("open", handleOpen);
      ws.addEventListener("close", handleClose);
    };

    void connect();

    return () => {
      cancelled = true;
      intentionalCloseRef.current = true;
      clearTimeout(reconnectTimeoutId);
      if (currentWs) {
        currentWs.removeEventListener("open", handleOpen);
        currentWs.removeEventListener("close", handleClose);
        currentWs.close();
      }
      socketRef.current = null;
    };
  }, [active, duelConfig, duelToken, activityAccessToken]);

  useEffect(() => {
    if (!active) {
      sentGuessCountRef.current = guesses.length;
      return;
    }
    if (guesses.length <= sentGuessCountRef.current) return;
    sentGuessCountRef.current = guesses.length;
    notifySyncChanged(socketRef.current);
  }, [active, guesses]);
};
