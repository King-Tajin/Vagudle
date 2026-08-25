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
} from "../lib/sync";
import { useSyncSocket } from "./useSyncSocket";
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

  useSyncSocket(
    active,
    () =>
      isDiscordActivity
        ? activityAccessToken
          ? requestActivityDailySyncTicket(activityAccessToken)
          : Promise.resolve(null)
        : (async () => {
            const idToken = await getIdTokenForCurrentUser();
            return idToken ? requestDailySyncTicket(idToken) : null;
          })(),
    () => void reconcileFromServerRef.current(),
    [isDiscordActivity, activityAccessToken],
    guesses
  );
};
