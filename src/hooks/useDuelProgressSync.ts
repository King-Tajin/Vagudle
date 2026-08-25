import { useEffect, useRef } from "react";
import type { CharStatus } from "../lib/statuses";
import { saveDuelProgress, saveActivityDuelProgress } from "../lib/duel";

type Params = {
  isDuelMode: boolean;
  duelToken: string | null;
  activityAccessToken: string | null;
  activityDuelId: string | null;
  guesses: string[];
  cellColors: { [key: string]: CharStatus };
};

export const useDuelProgressSync = ({
  isDuelMode,
  duelToken,
  activityAccessToken,
  activityDuelId,
  guesses,
  cellColors,
}: Params): void => {
  const sentCountRef = useRef(0);

  useEffect(() => {
    const hasTokenPath = !!duelToken;
    const hasActivityPath = !!activityAccessToken && !!activityDuelId;

    if (!isDuelMode || (!hasTokenPath && !hasActivityPath)) {
      sentCountRef.current = guesses.length;
      return;
    }
    if (guesses.length <= sentCountRef.current) return;
    sentCountRef.current = guesses.length;

    void (async () => {
      if (duelToken) {
        await saveDuelProgress(duelToken, guesses, cellColors);
      } else if (activityAccessToken && activityDuelId) {
        await saveActivityDuelProgress(
          activityAccessToken,
          activityDuelId,
          guesses,
          cellColors
        );
      }
    })();
  }, [
    isDuelMode,
    duelToken,
    activityAccessToken,
    activityDuelId,
    guesses,
    cellColors,
  ]);
};
