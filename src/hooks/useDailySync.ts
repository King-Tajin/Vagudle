import type React from "react";
import { useEffect, useRef } from "react";
import type { CharStatus } from "../lib/statuses";
import type { DailyConfig } from "../lib/daily";
import { fetchServerDailyProgress, saveDailyProgress } from "../lib/daily";
import { getIdTokenForCurrentUser } from "../lib/cloudSync";
import {
  requestDailySyncTicket,
  requestActivityDailySyncTicket,
  fetchServerActivityDailyProgress,
  openSyncSocket,
  notifySyncChanged,
} from "../lib/sync";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../constants/settings";

type Params = {
  isDailyMode: boolean;
  isDiscordActivity: boolean;
  activityAccessToken: string | null;
  isLoading: boolean;
  dailyConfig: DailyConfig | null;
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

export const useDailySync = ({
  isDailyMode,
  isDiscordActivity,
  activityAccessToken,
  isLoading,
  dailyConfig,
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

  const reconcileFromServerRef = useRef<() => Promise<void>>(async () => {});
  useEffect(() => {
    reconcileFromServerRef.current = async () => {
      if (!dailyConfig) return;
      const serverProgress = isDiscordActivity
        ? activityAccessToken
          ? await fetchServerActivityDailyProgress(activityAccessToken)
          : null
        : await (async () => {
            const idToken = await getIdTokenForCurrentUser();
            return idToken ? fetchServerDailyProgress(idToken) : null;
          })();
      if (!serverProgress) return;

      saveDailyProgress(dailyConfig.date, {
        guesses: serverProgress.guesses,
        cellColors: serverProgress.cellColors,
      });

      const wordUpper = dailyConfig.word.toUpperCase();
      const won = serverProgress.guesses.some(
        (g) => g.toUpperCase() === wordUpper
      );
      const maxChallenges = dailyConfig.hardMode
        ? HARD_MODE_MAX_CHALLENGES
        : NORMAL_MODE_MAX_CHALLENGES;
      const lost = !won && serverProgress.guesses.length >= maxChallenges;

      if (won || lost) restoredGameRef.current = true;

      setGuesses(serverProgress.guesses);
      setCellColors(serverProgress.cellColors as { [key: string]: CharStatus });
      setIsGameWon(won);
      setIsGameLost(lost);
    };
  });

  const active =
    isDailyMode &&
    !isLoading &&
    !!dailyConfig &&
    !isGameWon &&
    !isGameLost &&
    (!isDiscordActivity || !!activityAccessToken);

  useEffect(() => {
    if (!active) return;

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
      const ticket = isDiscordActivity
        ? activityAccessToken
          ? await requestActivityDailySyncTicket(activityAccessToken)
          : null
        : await (async () => {
            const idToken = await getIdTokenForCurrentUser();
            return idToken ? requestDailySyncTicket(idToken) : null;
          })();
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
  }, [active, isDiscordActivity, activityAccessToken]);

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
