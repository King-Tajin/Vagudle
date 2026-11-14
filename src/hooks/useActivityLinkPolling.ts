import { useCallback, useEffect, useRef, useState } from "react";
import {
  checkActivityAccountStatus,
  fetchActivityLinkUrl,
  openExternalLink,
} from "../lib/discord";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 5 * 60 * 1000;

export type ActivityLinkStatus =
  "idle" | "opening" | "waiting" | "timed_out" | "error";

export const useActivityLinkPolling = (accessToken: string | null) => {
  const [status, setStatus] = useState<ActivityLinkStatus>("idle");
  const runIdRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = useCallback(() => {
    runIdRef.current += 1;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => stop, [stop]);

  const cancel = useCallback(() => {
    stop();
    setStatus("idle");
  }, [stop]);

  const start = useCallback(
    async (onResolved: () => void | Promise<void>) => {
      if (!accessToken) return;
      stop();
      const runId = runIdRef.current;
      setStatus("opening");

      const url = await fetchActivityLinkUrl(accessToken);
      if (runIdRef.current !== runId) return;
      if (!url) {
        setStatus("error");
        return;
      }

      openExternalLink(url);
      setStatus("waiting");

      const startedAt = Date.now();
      let requestInFlight = false;
      intervalRef.current = setInterval(() => {
        if (requestInFlight) return;
        if (Date.now() - startedAt >= POLL_TIMEOUT_MS) {
          stop();
          setStatus("timed_out");
          return;
        }
        requestInFlight = true;
        void checkActivityAccountStatus(accessToken)
          .then(async (resolved) => {
            if (runIdRef.current !== runId || !resolved) return;
            stop();
            await onResolved();
          })
          .finally(() => {
            requestInFlight = false;
          });
      }, POLL_INTERVAL_MS);
    },
    [accessToken, stop]
  );

  return { status, start, cancel };
};
