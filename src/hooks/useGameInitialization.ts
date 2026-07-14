import React, { useEffect } from "react";
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
import { isDiscordActivity, bootActivity } from "../lib/discord";
import { runStorageOptimization } from "../lib/storageOptimizer";
import { CORRECT_WORD_MESSAGE } from "../constants/strings";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
  WELCOME_INFO_MODAL_MS,
} from "../constants/settings";

type Params = {
  challengeParam: string | null;
  duelParam: string | null;
  restoredGameRef: React.RefObject<boolean>;
  duelSubmittedRef: React.RefObject<boolean>;
  setIsLoading: (v: boolean) => void;
  setIsMalformedChallenge: (v: boolean) => void;
  setIsMalformedDuel: (v: boolean) => void;
  setIsDuelExpired: (v: boolean) => void;
  setIsActivityNotFound: (v: boolean) => void;
  setIsActivityWrongPlayer: (v: boolean) => void;
  setIsActivityServerError: (v: boolean) => void;
  setChallengeConfig: (v: ChallengeConfig) => void;
  setDuelConfig: (v: DuelConfig) => void;
  setDuelToken: (v: string) => void;
  setActivityAccessToken: (v: string) => void;
  setSolution: (v: string) => void;
  setGuesses: (v: string[]) => void;
  setCellColors: React.Dispatch<
    React.SetStateAction<{ [key: string]: CharStatus }>
  >;
  setAutoGrayLetters: React.Dispatch<React.SetStateAction<Set<string>>>;
  setIsGameWon: (v: boolean) => void;
  setIsGameLost: (v: boolean) => void;
  setIsChallengeModalOpen: (v: boolean) => void;
  setIsDuelModalOpen: (v: boolean) => void;
  setIsInfoModalOpen: (v: boolean) => void;
  setIsStatsModalOpen: (v: boolean) => void;
  showErrorAlert: (message: string, options?: { persist?: boolean }) => void;
};

export const useGameInitialization = ({
  challengeParam,
  duelParam,
  restoredGameRef,
  duelSubmittedRef,
  setIsLoading,
  setIsMalformedChallenge,
  setIsMalformedDuel,
  setIsDuelExpired,
  setIsActivityNotFound,
  setIsActivityWrongPlayer,
  setIsActivityServerError,
  setChallengeConfig,
  setDuelConfig,
  setDuelToken,
  setActivityAccessToken,
  setSolution,
  setGuesses,
  setCellColors,
  setAutoGrayLetters,
  setIsGameWon,
  setIsGameLost,
  setIsChallengeModalOpen,
  setIsDuelModalOpen,
  setIsInfoModalOpen,
  setIsStatsModalOpen,
  showErrorAlert,
}: Params) => {
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
          setAutoGrayLetters(new Set());
          return false;
        }
        setGuesses(savedDuel.guesses);
        setCellColors(savedDuel.cellColors as { [key: string]: CharStatus });
        setAutoGrayLetters(new Set(savedDuel.autoGrayLetters));
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

      if (isDiscordActivity) {
        const boot = await bootActivity();

        if (!boot.ok) {
          if (boot.reason === "not_found") setIsActivityNotFound(true);
          else if (boot.reason === "wrong_player")
            setIsActivityWrongPlayer(true);
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
          setAutoGrayLetters(new Set(savedChallenge.autoGrayLetters));
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
          setAutoGrayLetters(new Set());
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
        setAutoGrayLetters(new Set(savedState.autoGrayLetters ?? []));
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
        setAutoGrayLetters(new Set());
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};
