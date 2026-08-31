import {
  DICT_LABELS,
  type ChallengeDict,
  type ChallengeConfig,
} from "../../../lib/challenge";
import { isWordInDict } from "../../../lib/words";
import { doShare } from "../../../lib/share";
import { SHARE_CHALLENGE_INVITE_TITLE } from "../../../constants/strings";

export type WordStatus = "idle" | "valid" | "invalid-word" | "invalid-length";
export type Generated = { word: string; url: string; config: ChallengeConfig };
export type GenerateStatus = "idle" | "loading" | "error";

export const WORD_STATUS_BORDER_COLOR: Record<WordStatus, string> = {
  idle: "rgba(255,255,255,0.1)",
  valid: "#4a7c3f",
  "invalid-word": "#dc3232",
  "invalid-length": "#dc3232",
};

export interface DictHint {
  foundIn: ChallengeDict | null;
  easierThan: ChallengeDict | null;
}

export const DICT_ORDER: ChallengeDict[] = ["normal", "hard", "full"];

export const getDictHints = (
  word: string,
  selected: ChallengeDict
): DictHint => {
  const inSelected = isWordInDict(word, selected);
  const selectedIdx = DICT_ORDER.indexOf(selected);

  if (!inSelected) {
    const foundIn =
      DICT_ORDER.find((d) => d !== selected && isWordInDict(word, d)) ?? null;
    return { foundIn, easierThan: null };
  }

  const easierThan =
    DICT_ORDER.slice(0, selectedIdx).find((d) => isWordInDict(word, d)) ?? null;

  return { foundIn: null, easierThan };
};

export const computeAutoFillState = (
  autoFilledWord: string | undefined,
  dict: ChallengeDict
): { status: WordStatus; hints: DictHint; generateStatus: GenerateStatus } => {
  const idle = { foundIn: null, easierThan: null };
  if (!autoFilledWord)
    return { status: "idle", hints: idle, generateStatus: "idle" };

  const w = autoFilledWord.toUpperCase().replace(/[^A-Z]/g, "");
  if (w.length < 4 || w.length > 7) {
    return { status: "invalid-length", hints: idle, generateStatus: "idle" };
  }

  if (isWordInDict(w, dict)) {
    return {
      status: "valid",
      hints: getDictHints(w, dict),
      generateStatus: "loading",
    };
  }

  return {
    status: "invalid-word",
    hints: getDictHints(w, dict),
    generateStatus: "idle",
  };
};

export type GenerationState = {
  generated: Generated | null;
  status: GenerateStatus;
  copied: boolean;
  shared: boolean;
};

export type GenerationAction =
  | { type: "reset" }
  | { type: "start" }
  | { type: "success"; generated: Generated }
  | { type: "error" }
  | { type: "copied" }
  | { type: "hideCopied" }
  | { type: "shared" }
  | { type: "hideShared" };

export const generationReducer = (
  state: GenerationState,
  action: GenerationAction
): GenerationState => {
  switch (action.type) {
    case "reset":
      return { generated: null, status: "idle", copied: false, shared: false };
    case "start":
      return { ...state, status: "loading" };
    case "success":
      return {
        generated: action.generated,
        status: "idle",
        copied: false,
        shared: false,
      };
    case "error":
      return { ...state, status: "error" };
    case "copied":
      return { ...state, copied: true };
    case "hideCopied":
      return { ...state, copied: false };
    case "shared":
      return { ...state, shared: true };
    case "hideShared":
      return { ...state, shared: false };
    default:
      return state;
  }
};

export const shareChallenge = async (
  generated: Generated,
  onCopied: () => void
) => {
  const { config, url } = generated;
  const text =
    `I'm challenging you to a custom Vagudle!\n` +
    `${config.length} letters · ${DICT_LABELS[config.dict]} dictionary · ${
      config.guesses
    } guesses\n` +
    `(Results won't affect your stats)\n` +
    url;

  await doShare({ title: SHARE_CHALLENGE_INVITE_TITLE, text }, text, onCopied);
};
