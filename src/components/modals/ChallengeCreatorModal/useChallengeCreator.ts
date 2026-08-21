import { useState, useEffect, useReducer, useRef } from "react";
import type React from "react";
import {
  encodeChallenge,
  buildChallengeUrl,
  type ChallengeDict,
  type ChallengeConfig,
} from "../../../lib/challenge";
import { isWordInDict } from "../../../lib/words";
import {
  computeAutoFillState,
  getDictHints,
  generationReducer,
  shareChallenge,
  type WordStatus,
  type DictHint,
} from "./challengeLogic";

export type UseChallengeCreatorArgs = {
  autoFilledWord?: string;
  autoFilledDict?: ChallengeDict;
  autoFilledGuesses?: 9 | 11;
};

export const useChallengeCreator = ({
  autoFilledWord,
  autoFilledDict,
  autoFilledGuesses,
}: UseChallengeCreatorArgs) => {
  const [dict, setDict] = useState<ChallengeDict>(autoFilledDict ?? "normal");
  const [guesses, setGuesses] = useState<9 | 11>(autoFilledGuesses ?? 11);
  const [wordInput, setWordInput] = useState(() =>
    (autoFilledWord ?? "").toUpperCase().replace(/[^A-Z]/g, "")
  );
  const [wordStatus, setWordStatus] = useState<WordStatus>(
    () =>
      computeAutoFillState(autoFilledWord, autoFilledDict ?? "normal").status
  );
  const [dictHints, setDictHints] = useState<DictHint>(
    () => computeAutoFillState(autoFilledWord, autoFilledDict ?? "normal").hints
  );
  const [generationState, dispatchGeneration] = useReducer(
    generationReducer,
    undefined,
    () => ({
      generated: null,
      status: computeAutoFillState(autoFilledWord, autoFilledDict ?? "normal")
        .generateStatus,
      copied: false,
      shared: false,
    })
  );
  const { generated, status: generateStatus, copied, shared } = generationState;
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sharedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      if (sharedTimerRef.current) clearTimeout(sharedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!autoFilledWord) return;
    let cancelled = false;

    const w = autoFilledWord.toUpperCase().replace(/[^A-Z]/g, "");
    const d = autoFilledDict ?? "normal";
    const g = autoFilledGuesses ?? 11;

    if (w.length < 4 || w.length > 7 || !isWordInDict(w, d)) {
      return () => {
        cancelled = true;
      };
    }

    const config: Omit<ChallengeConfig, "id"> = {
      word: w,
      dict: d,
      guesses: g,
      length: w.length,
    };
    void encodeChallenge(config).then((result) => {
      if (cancelled) return;
      if (!result) {
        dispatchGeneration({ type: "error" });
        return;
      }
      const fullConfig: ChallengeConfig = { ...config, id: result.id };
      dispatchGeneration({
        type: "success",
        generated: {
          word: w,
          url: buildChallengeUrl(result.encoded),
          config: fullConfig,
        },
      });
    });

    return () => {
      cancelled = true;
    };
    // Autofill should only run once on mount, not re-run if the URL params change later.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cleanInput = wordInput.toUpperCase().replace(/[^A-Z]/g, "");

  const validateWord = (
    raw: string,
    currentDict: ChallengeDict = dict,
    strict = false
  ) => {
    const w = raw.toUpperCase().replace(/[^A-Z]/g, "");
    if (w.length < 4) {
      setWordStatus(strict ? "invalid-length" : "idle");
      setDictHints({ foundIn: null, easierThan: null });
      return;
    }
    if (w.length > 7) {
      setWordStatus("invalid-length");
      setDictHints({ foundIn: null, easierThan: null });
      return;
    }
    const inSelected = isWordInDict(w, currentDict);
    setWordStatus(inSelected ? "valid" : "invalid-word");
    setDictHints(getDictHints(w, currentDict));
  };

  const handleDictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as ChallengeDict;
    setDict(next);
    dispatchGeneration({ type: "reset" });
    if (cleanInput.length > 0) validateWord(cleanInput, next);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, "");
    setWordInput(raw);
    dispatchGeneration({ type: "reset" });
    validateWord(raw);
  };

  const handleBlur = () => {
    if (cleanInput.length > 0) validateWord(cleanInput, dict, true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.key === "Enter" && cleanInput.length > 0)
      validateWord(cleanInput, dict, true);
  };

  const handleGuessesChange = (v: 9 | 11) => {
    setGuesses(v);
    dispatchGeneration({ type: "reset" });
  };

  const generate = async () => {
    if (wordStatus !== "valid") {
      validateWord(cleanInput, dict, true);
      return;
    }
    dispatchGeneration({ type: "start" });
    const config: Omit<ChallengeConfig, "id"> = {
      word: cleanInput,
      dict,
      guesses,
      length: cleanInput.length,
    };
    const result = await encodeChallenge(config);
    if (!result) {
      dispatchGeneration({ type: "error" });
      return;
    }
    const fullConfig: ChallengeConfig = { ...config, id: result.id };
    dispatchGeneration({
      type: "success",
      generated: {
        word: cleanInput,
        url: buildChallengeUrl(result.encoded),
        config: fullConfig,
      },
    });
  };

  const copyLink = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.url);
      dispatchGeneration({ type: "copied" });
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(
        () => dispatchGeneration({ type: "hideCopied" }),
        2500
      );
    } catch {}
  };

  const handleShare = async () => {
    if (!generated) return;
    await shareChallenge(generated, () => {
      dispatchGeneration({ type: "shared" });
      if (sharedTimerRef.current) clearTimeout(sharedTimerRef.current);
      sharedTimerRef.current = setTimeout(
        () => dispatchGeneration({ type: "hideShared" }),
        2500
      );
    });
  };

  const handleEdit = () => {
    dispatchGeneration({ type: "reset" });
  };

  return {
    dict,
    guesses,
    wordInput,
    wordStatus,
    dictHints,
    cleanInput,
    generated,
    generateStatus,
    copied,
    shared,
    handleDictChange,
    handleInput,
    handleBlur,
    handleKeyDown,
    handleGuessesChange,
    generate,
    copyLink,
    handleShare,
    handleEdit,
  };
};
