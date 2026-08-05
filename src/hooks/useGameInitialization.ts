import type React from "react";
import { useEffect, useCallback } from "react";
import type { CharStatus } from "../lib/statuses";
import { initWordLists, isWordInDict, getRandomWord } from "../lib/words";
import {
  loadGameStateFromLocalStorage,
  loadSettingsFromLocalStorage,
} from "../lib/localStorage";
import {
  decodeChallenge,
  loadChallengeState,
  pruneOldChallengeStates,
  type ChallengeConfig,
} from "../lib/challenge";
import {
  decodeDuel,
  loadDuelState,
  pruneOldDuelStates,
  type DuelConfig,
} from "../lib/duel";
import {
  isDiscordActivity,
  activityMode,
  bootActivity,
  startDailyActivity,
  type DailyActivityPayload,
  type DailyActivityStartResult,
} from "../lib/discord";
import { runStorageOptimization } from "../lib/storageOptimizer";
import {
  fetchDailyConfig,
  loadDailyResult,
  loadDailyProgress,
  saveDailyProgress,
  saveDailyResult,
  recordDailyStats,
  clearDailyProgress,
  fetchServerDailyProgress,
  type DailyConfig,
  type DailyResult,
  type DailyStats,
} from "../lib/daily";
import { getIdTokenForCurrentUser } from "../lib/cloudSync";
import { CORRECT_WORD_MESSAGE } from "../constants/strings";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
  WELCOME_INFO_MODAL_MS,
} from "../constants/settings";

type Params = {
  challengeParam: string | null;
  duelParam: string | null;
  isDailyRoute: boolean;
  restoredGameRef: React.RefObject<boolean>;
  duelSubmittedRef: React.RefObject<boolean>;
  setIsLoading: (v: boolean) => void;
  setIsMalformedChallenge: (v: boolean) => void;
  setIsMalformedDuel: (v: boolean) => void;
  setIsDuelExpired: (v: boolean) => void;
  setIsActivityWrongPlayer: (v: boolean) => void;
  setIsActivityServerError: (v: boolean) => void;
  setIsActivityAccountChoicePending: (v: boolean) => void;
  setIsActivityAlreadyPlayed: (v: boolean) => void;
  setActivityAlreadyPlayedPlatform: (v: string | undefined) => void;
  setChallengeConfig: (v: ChallengeConfig) => void;
  setDuelConfig: (v: DuelConfig) => void;
  setDuelToken: (v: string) => void;
  setActivityAccessToken: (v: string) => void;
  setSolution: (v: string) => void;
  setGuesses: (v: string[]) => void;
  setCellColors: React.Dispatch<
    React.SetStateAction<{ [key: string]: CharStatus }>
  >;
  setIsGameWon: (v: boolean) => void;
  setIsGameLost: (v: boolean) => void;
  setIsChallengeModalOpen: (v: boolean) => void;
  setIsDuelModalOpen: (v: boolean) => void;
  setIsInfoModalOpen: (v: boolean) => void;
  setIsStatsModalOpen: (v: boolean) => void;
  setIsDailyActive: (v: boolean) => void;
  setDailyConfig: (v: DailyConfig) => void;
  setDailyResult: (v: DailyResult) => void;
  setDailyStats: (v: DailyStats) => void;
  setIsDailyModalOpen: (v: boolean) => void;
  setDailyModalMode: (v: "loading" | "error" | "play" | "complete") => void;
  onDailyRestoredComplete?: (date: string, won: boolean) => void;
  showErrorAlert: (message: string, options?: { persist?: boolean }) => void;
};

export const useGameInitialization = ({
  challengeParam,
  duelParam,
  isDailyRoute,
  restoredGameRef,
  duelSubmittedRef,
  setIsLoading,
  setIsMalformedChallenge,
  setIsMalformedDuel,
  setIsDuelExpired,
  setIsActivityWrongPlayer,
  setIsActivityServerError,
  setIsActivityAccountChoicePending,
  setIsActivityAlreadyPlayed,
  setActivityAlreadyPlayedPlatform,
  setChallengeConfig,
  setDuelConfig,
  setDuelToken,
  setActivityAccessToken,
  setSolution,
  setGuesses,
  setCellColors,
  setIsGameWon,
  setIsGameLost,
  setIsChallengeModalOpen,
  setIsDuelModalOpen,
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  setIsDailyActive,
  setDailyConfig,
  setDailyResult,
  setDailyStats,
  setIsDailyModalOpen,
  setDailyModalMode,
  onDailyRestoredComplete,
  showErrorAlert,
}: Params) => {
  const applyDailyActivityPayload = useCallback(
    (payload: DailyActivityPayload) => {
      const config: DailyConfig = {
        date: payload.date,
        word: payload.word,
        wordLength: payload.wordLength,
        hardMode: payload.hardMode,
        originDate: payload.originDate,
      };
      setDailyConfig(config);
      setIsDailyActive(true);

      const existingResult = loadDailyResult(config.date);
      if (existingResult) {
        setDailyResult(existingResult);
        setDailyModalMode("complete");
        setIsDailyModalOpen(true);
        return;
      }

      const serverProgress = payload.guesses
        ? { guesses: payload.guesses, cellColors: payload.cellColors ?? {} }
        : null;
      const progress = serverProgress ?? loadDailyProgress(config.date);
      if (serverProgress) {
        saveDailyProgress(config.date, serverProgress);
      }
      const dailyMaxChallenges = config.hardMode
        ? HARD_MODE_MAX_CHALLENGES
        : NORMAL_MODE_MAX_CHALLENGES;
      const restoredGuesses = progress?.guesses ?? [];
      const wordUpper = config.word.toUpperCase();
      const won = restoredGuesses.some((g) => g.toUpperCase() === wordUpper);
      const lost = !won && restoredGuesses.length >= dailyMaxChallenges;

      setSolution(wordUpper);
      setGuesses(restoredGuesses);
      setCellColors(
        (progress?.cellColors as { [key: string]: CharStatus }) ?? {}
      );
      if (won || lost) restoredGameRef.current = true;
      setIsGameWon(won);
      setIsGameLost(lost);

      if (won || lost) {
        const result: DailyResult = {
          date: config.date,
          won,
          guessCount: restoredGuesses.length,
          maxGuesses: dailyMaxChallenges,
          wordLength: config.wordLength,
          completedAt: Date.now(),
          guesses: restoredGuesses,
          cellColors: progress?.cellColors,
        };
        saveDailyResult(result);
        setDailyResult(result);
        setDailyStats(recordDailyStats(config.date, won));
        clearDailyProgress(config.date);
        setDailyModalMode("complete");
      } else {
        setDailyModalMode("play");
      }
      setIsDailyModalOpen(true);
    },
    [
      restoredGameRef,
      setCellColors,
      setDailyConfig,
      setDailyModalMode,
      setDailyResult,
      setDailyStats,
      setGuesses,
      setIsDailyActive,
      setIsDailyModalOpen,
      setIsGameLost,
      setIsGameWon,
      setSolution,
    ]
  );

  const resolveDailyActivityAccount = useCallback(
    (result: DailyActivityStartResult) => {
      setIsActivityAccountChoicePending(false);
      if (!result.ok) {
        if (result.reason === "already_attempted") {
          setActivityAlreadyPlayedPlatform(result.platform);
          setIsActivityAlreadyPlayed(true);
        } else {
          setIsActivityServerError(true);
        }
        return;
      }
      setActivityAccessToken(result.accessToken);
      applyDailyActivityPayload(result.payload);
    },
    [
      applyDailyActivityPayload,
      setActivityAccessToken,
      setActivityAlreadyPlayedPlatform,
      setIsActivityAccountChoicePending,
      setIsActivityAlreadyPlayed,
      setIsActivityServerError,
    ]
  );

  useEffect(() => {
    let cancelled = false;
    let modalTimeoutId: ReturnType<typeof setTimeout> | undefined;

    const run = async () => {
      runStorageOptimization();
      pruneOldChallengeStates();
      pruneOldDuelStates();
      const loadStart = Date.now();
      const savedSettings = loadSettingsFromLocalStorage();
      const savedState = loadGameStateFromLocalStorage();

      try {
        await initWordLists();
      } catch {
        showErrorAlert("Failed to load word lists. Please refresh the page.", {
          persist: true,
        });
        setIsLoading(false);
        return;
      }

      const restoreDuelState = (
        duelId: string,
        discordId: string,
        wordUpper: string,
        maxGuesses: number
      ): boolean => {
        const savedDuel = loadDuelState(duelId, discordId);
        if (!savedDuel) {
          setGuesses([]);
          setCellColors({});
          return false;
        }
        setGuesses(savedDuel.guesses);
        setCellColors(savedDuel.cellColors as { [key: string]: CharStatus });
        const won = savedDuel.guesses.some(
          (g) => g.toUpperCase() === wordUpper
        );
        const lost = !won && savedDuel.guesses.length >= maxGuesses;
        if (won) {
          restoredGameRef.current = true;
          duelSubmittedRef.current = true;
          setIsGameWon(true);
        } else if (lost) {
          restoredGameRef.current = true;
          duelSubmittedRef.current = true;
          setIsGameLost(true);
        }
        return won || lost;
      };

      const bootDailyActivity = async (): Promise<void> => {
        const dailyBoot = await startDailyActivity(false);

        if (!dailyBoot.ok) {
          if (dailyBoot.reason === "account_not_linked") {
            setActivityAccessToken(dailyBoot.accessToken);
            setIsActivityAccountChoicePending(true);
          } else if (dailyBoot.reason === "already_attempted") {
            setActivityAlreadyPlayedPlatform(dailyBoot.platform);
            setIsActivityAlreadyPlayed(true);
          } else {
            setIsActivityServerError(true);
          }
          setIsLoading(false);
          return;
        }

        setActivityAccessToken(dailyBoot.accessToken);
        applyDailyActivityPayload(dailyBoot.payload);
        setIsLoading(false);
      };

      if (isDiscordActivity && activityMode === "daily") {
        await bootDailyActivity();
        return;
      }

      if (isDiscordActivity) {
        const boot = await bootActivity();

        if (!boot.ok) {
          if (boot.reason === "not_found") {
            await bootDailyActivity();
            return;
          }
          if (boot.reason === "wrong_player") setIsActivityWrongPlayer(true);
          else setIsActivityServerError(true);
          setIsLoading(false);
          return;
        }

        const { accessToken, discordUserId, payload } = boot;

        const config: DuelConfig = {
          word: payload.word,
          dict: payload.dict_type,
          guesses: payload.max_guesses as 9 | 11,
          id: payload.duel_id,
          length: payload.word_length,
          discord_id: discordUserId,
          created_at: new Date(payload.generated_at).getTime(),
        };

        const wordUpper = config.word.toUpperCase();
        if (!isWordInDict(wordUpper, config.dict)) {
          console.error(
            `[Activity] Word "${wordUpper}" not found in dict "${config.dict}"`
          );
          setIsActivityServerError(true);
          setIsLoading(false);
          return;
        }

        setDuelConfig(config);
        setActivityAccessToken(accessToken);
        setSolution(wordUpper);

        const alreadyFinished = restoreDuelState(
          config.id,
          discordUserId,
          wordUpper,
          config.guesses
        );
        setIsDuelModalOpen(!alreadyFinished);
        setIsLoading(false);
        return;
      }

      if (challengeParam) {
        const config = await decodeChallenge(challengeParam);
        if (!config) {
          setIsMalformedChallenge(true);
          setIsLoading(false);
          return;
        }

        const wordUpper = config.word.toUpperCase();
        if (!isWordInDict(wordUpper, config.dict)) {
          setIsMalformedChallenge(true);
          setIsLoading(false);
          return;
        }

        setChallengeConfig(config);
        setSolution(wordUpper);

        const savedChallenge = loadChallengeState(config.id);
        let alreadyFinished = false;
        if (savedChallenge) {
          setGuesses(savedChallenge.guesses);
          setCellColors(
            savedChallenge.cellColors as { [key: string]: CharStatus }
          );
          const won = savedChallenge.guesses.some(
            (g) => g.toUpperCase() === wordUpper
          );
          const lost = !won && savedChallenge.guesses.length >= config.guesses;
          if (won) {
            restoredGameRef.current = true;
            setIsGameWon(true);
          } else if (lost) {
            restoredGameRef.current = true;
            setIsGameLost(true);
          }
          alreadyFinished = won || lost;
        } else {
          setGuesses([]);
          setCellColors({});
        }
        setIsChallengeModalOpen(!alreadyFinished);
        setIsLoading(false);
        return;
      }

      if (duelParam) {
        const result = await decodeDuel(duelParam);
        if (!result) {
          setIsMalformedDuel(true);
          setIsLoading(false);
          return;
        }
        if (result.expired) {
          setIsDuelExpired(true);
          setIsLoading(false);
          return;
        }

        const config = result.config;
        const wordUpper = config.word.toUpperCase();
        if (!isWordInDict(wordUpper, config.dict)) {
          setIsMalformedDuel(true);
          setIsLoading(false);
          return;
        }

        setDuelConfig(config);
        setDuelToken(duelParam);
        setSolution(wordUpper);

        const alreadyFinished = restoreDuelState(
          config.id,
          config.discord_id,
          wordUpper,
          config.guesses
        );
        setIsDuelModalOpen(!alreadyFinished);
        setIsLoading(false);
        return;
      }

      let resumedActiveDaily = false;

      if (isDailyRoute) {
        const config = await fetchDailyConfig();
        if (!config) {
          setDailyModalMode("error");
          setIsDailyModalOpen(true);
        } else {
          setDailyConfig(config);

          const existingResult = loadDailyResult(config.date);
          if (existingResult) {
            setDailyResult(existingResult);
            setDailyModalMode("complete");
            setIsDailyModalOpen(true);
          } else {
            let progress = loadDailyProgress(config.date);
            const idToken = await getIdTokenForCurrentUser();
            if (idToken) {
              const serverProgress = await fetchServerDailyProgress(idToken);
              if (
                serverProgress &&
                serverProgress.guesses.length > (progress?.guesses.length ?? 0)
              ) {
                progress = serverProgress;
                saveDailyProgress(config.date, serverProgress);
              }
            }
            if (progress) {
              const dailyMaxChallenges = config.hardMode
                ? HARD_MODE_MAX_CHALLENGES
                : NORMAL_MODE_MAX_CHALLENGES;
              const restoredGuesses = progress.guesses ?? [];
              const wordUpper = config.word.toUpperCase();
              const won = restoredGuesses.some(
                (guess) => guess.toUpperCase() === wordUpper
              );
              const lost = !won && restoredGuesses.length >= dailyMaxChallenges;

              resumedActiveDaily = true;
              setIsDailyActive(true);
              setSolution(wordUpper);
              setGuesses(restoredGuesses);
              setCellColors(
                progress.cellColors as { [key: string]: CharStatus }
              );
              if (won || lost) restoredGameRef.current = true;
              setIsGameWon(won);
              setIsGameLost(lost);

              if (won || lost) {
                const result: DailyResult = {
                  date: config.date,
                  won,
                  guessCount: restoredGuesses.length,
                  maxGuesses: dailyMaxChallenges,
                  wordLength: config.wordLength,
                  completedAt: Date.now(),
                  guesses: restoredGuesses,
                  cellColors: progress.cellColors,
                };
                saveDailyResult(result);
                setDailyResult(result);
                setDailyStats(recordDailyStats(config.date, won));
                clearDailyProgress(config.date);
                setDailyModalMode("complete");
                setIsDailyModalOpen(true);
                onDailyRestoredComplete?.(config.date, won);
              }
            } else {
              setDailyModalMode("play");
              setIsDailyModalOpen(true);
            }
          }
        }

        if (resumedActiveDaily) {
          setIsLoading(false);
          return;
        }
      }

      const elapsed = Date.now() - loadStart;
      const remaining = Math.max(0, 1750 - elapsed);
      await new Promise((r) => setTimeout(r, remaining));

      if (savedState) {
        const gameWasWon = savedState.guesses.some(
          (g) => g.toUpperCase() === savedState.solution.toUpperCase()
        );
        const savedHardMode = savedState.hardMode ?? savedSettings.hardMode;
        const savedMaxChallenges = savedHardMode
          ? HARD_MODE_MAX_CHALLENGES
          : NORMAL_MODE_MAX_CHALLENGES;
        setSolution(savedState.solution);
        setGuesses(savedState.guesses);
        setCellColors(
          (savedState.cellColors as { [key: string]: CharStatus }) ?? {}
        );
        if (gameWasWon) {
          restoredGameRef.current = true;
          setIsGameWon(true);
        } else if (savedState.guesses.length >= savedMaxChallenges) {
          restoredGameRef.current = true;
          setIsGameLost(true);
          showErrorAlert(CORRECT_WORD_MESSAGE(savedState.solution), {
            persist: true,
          });
          modalTimeoutId = setTimeout(() => {
            if (!cancelled) setIsStatsModalOpen(true);
          }, 500);
        }
      } else {
        const newSolution = getRandomWord(
          savedSettings.wordLength,
          savedSettings.hardMode
        );
        setSolution(newSolution);
        setGuesses([]);
        setCellColors({});
        modalTimeoutId = setTimeout(() => {
          if (!cancelled) setIsInfoModalOpen(true);
        }, WELCOME_INFO_MODAL_MS);
      }
      setIsLoading(false);
    };
    void run();
    return () => {
      cancelled = true;
      clearTimeout(modalTimeoutId);
    };
    // Game initialization should only run once on mount, not re-run on prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { resolveDailyActivityAccount };
};
