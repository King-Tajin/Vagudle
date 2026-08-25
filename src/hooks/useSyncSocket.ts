import { useEffect, useRef, type DependencyList } from "react";
import { openSyncSocket, notifySyncChanged } from "../lib/sync";

const RECONNECT_DELAY_MS = 1500;
const MAX_RECONNECT_ATTEMPTS = 2;

export const useSyncSocket = (
  active: boolean,
  getTicket: () => Promise<string | null>,
  onSync: () => void,
  deps: DependencyList,
  guesses: string[]
) => {
  const socketRef = useRef<WebSocket | null>(null);
  const sentGuessCountRef = useRef(0);
  const reconnectAttemptsRef = useRef(0);
  const intentionalCloseRef = useRef(false);

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
      const ticket = await getTicket();
      if (!ticket || cancelled) return;

      const ws = openSyncSocket(ticket, onSync);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, ...deps]);

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
