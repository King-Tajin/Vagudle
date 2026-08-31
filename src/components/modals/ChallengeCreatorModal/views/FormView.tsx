import React from "react";
import { AlertCircle, CheckCircle, Info, Link } from "lucide-react";
import {
  DICT_LABELS,
  DICT_DESCRIPTIONS,
  type ChallengeDict,
} from "../../../../lib/challenge";
import { BackButton, ButtonGroup } from "../Controls";
import {
  WORD_STATUS_BORDER_COLOR,
  type WordStatus,
  type DictHint,
  type GenerateStatus,
} from "../challengeLogic";
import strings from "../../../../constants/strings";

const GUESSES_OPTIONS = [
  { value: 9 as const, label: "9" },
  { value: 11 as const, label: "11" },
];

export const FormView = ({
  onBack,
  hasAutoFilledWord,
  generateStatus,
  dict,
  wordInput,
  wordStatus,
  dictHints,
  cleanInput,
  guesses,
  onDictChange,
  onInput,
  onBlur,
  onKeyDown,
  onGuessesChange,
  onGenerate,
}: {
  onBack?: () => void;
  hasAutoFilledWord: boolean;
  generateStatus: GenerateStatus;
  dict: ChallengeDict;
  wordInput: string;
  wordStatus: WordStatus;
  dictHints: DictHint;
  cleanInput: string;
  guesses: 9 | 11;
  onDictChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onInput: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onGuessesChange: (v: 9 | 11) => void;
  onGenerate: () => void;
}) => {
  return (
    <div className="space-y-4">
      {onBack && <BackButton onClick={onBack} />}
      {generateStatus === "error" && hasAutoFilledWord && (
        <div
          className="p-3"
          style={{
            background: "rgba(220,50,50,0.08)",
            border: "1px solid rgba(220,50,50,0.3)",
          }}
        >
          <p className="font-code text-xs text-spice-red">
            {strings.CHALLENGE_FORM_AUTO_GENERATE_ERROR_TEXT}
          </p>
        </div>
      )}
      <div
        className="flex gap-2 p-2.5"
        style={{
          background: "rgba(255,215,0,0.04)",
          border: "1px solid rgba(255,215,0,0.18)",
        }}
      >
        <Info className="w-3.5 h-3.5 text-crown-amber shrink-0 mt-0.5" />
        <p className="font-code text-xs text-gray-400 leading-relaxed">
          <span className="text-crown-amber">
            {strings.CHALLENGE_FORM_NOTE_LABEL}
          </span>{" "}
          {strings.CHALLENGE_FORM_NOTE_TEXT}
        </p>
      </div>
      <div>
        <label
          htmlFor="challenge-dictionary"
          className="font-pixel text-xs text-crown-amber tracking-widest mb-2 block"
        >
          {strings.CHALLENGE_FORM_DICTIONARY_LABEL}
        </label>
        <select
          id="challenge-dictionary"
          value={dict}
          onChange={onDictChange}
          className="w-full border-2 font-code text-sm p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber transition-colors"
          style={{
            background: "#0a0014",
            borderColor: "#d4af37",
            color: "#d1d5db",
          }}
        >
          {(["normal", "hard", "full"] as ChallengeDict[]).map((d) => (
            <option key={d} value={d}>
              {DICT_LABELS[d]} — {DICT_DESCRIPTIONS[d]}
            </option>
          ))}
        </select>
      </div>
      <div className="border-t border-obsidian-700" />
      <div>
        <p
          id="challenge-word-label"
          className="font-pixel text-xs text-crown-amber tracking-widest mb-2"
        >
          {strings.CHALLENGE_FORM_WORD_LABEL}
        </p>
        <div className="relative">
          <input
            type="text"
            value={wordInput}
            onChange={onInput}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            maxLength={7}
            placeholder={strings.CHALLENGE_FORM_WORD_PLACEHOLDER}
            aria-labelledby="challenge-word-label"
            className="w-full border-2 font-pixel text-sm p-2 pr-8 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber tracking-widest uppercase"
            style={{
              background: "#0a0014",
              borderColor: WORD_STATUS_BORDER_COLOR[wordStatus],
              color: wordStatus === "valid" ? "#4ade80" : "#d1d5db",
              letterSpacing: "0.15em",
            }}
          />
          {wordStatus === "valid" && (
            <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
          )}
          {(wordStatus === "invalid-word" ||
            wordStatus === "invalid-length") && (
            <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-spice-red" />
          )}
        </div>

        {wordStatus === "invalid-length" && (
          <p className="font-code text-xs text-spice-red mt-1">
            {strings.CHALLENGE_FORM_INVALID_LENGTH_TEXT}
          </p>
        )}

        {wordStatus === "invalid-word" && (
          <>
            <p className="font-code text-xs text-spice-red mt-1">
              {strings.CHALLENGE_FORM_INVALID_WORD_TEXT(
                cleanInput,
                DICT_LABELS[dict].toLowerCase()
              )}
            </p>
            {dictHints.foundIn && (
              <p
                className="font-code text-xs mt-1"
                style={{ color: "#a78bfa" }}
              >
                {strings.CHALLENGE_FORM_AVAILABLE_IN_OTHER_DICT_TEXT(
                  DICT_LABELS[dictHints.foundIn].toLowerCase()
                )}
              </p>
            )}
          </>
        )}

        {wordStatus === "valid" && (
          <>
            <p className="font-code text-xs text-green-400 mt-1">
              {strings.CHALLENGE_FORM_VALID_WORD_TEXT(
                cleanInput,
                cleanInput.length
              )}
            </p>
            {dictHints.easierThan && (
              <p
                className="font-code text-xs mt-1"
                style={{ color: "#facc15" }}
              >
                {strings.CHALLENGE_FORM_EASIER_DICT_HINT_TEXT(
                  DICT_LABELS[dictHints.easierThan].toLowerCase()
                )}
              </p>
            )}
          </>
        )}

        {wordStatus === "idle" && (
          <p className="font-code text-xs text-gray-500 mt-1">
            {strings.CHALLENGE_FORM_MUST_BE_IN_DICT_TEXT(
              DICT_LABELS[dict].toLowerCase()
            )}
          </p>
        )}
      </div>
      <div className="border-t border-obsidian-700" />
      <div>
        <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
          {strings.CHALLENGE_FORM_GUESSES_ALLOWED_LABEL}
        </p>
        <ButtonGroup
          options={GUESSES_OPTIONS}
          value={guesses}
          onChange={onGuessesChange}
        />
      </div>
      <div className="border-t border-obsidian-700" />
      <p
        className="font-code text-xs leading-snug"
        style={{ color: "rgba(212,175,55,0.6)" }}
      >
        {strings.CHALLENGE_FORM_RESULTS_WARNING_TEXT}
      </p>
      {generateStatus === "error" && !hasAutoFilledWord && (
        <p className="font-code text-xs text-spice-red">
          {strings.CHALLENGE_FORM_GENERATE_ERROR_TEXT}
        </p>
      )}
      <button
        type="button"
        onClick={onGenerate}
        disabled={wordStatus !== "valid" || generateStatus === "loading"}
        className="w-full py-3 font-pixel text-xs tracking-widest transition-colors flex items-center justify-center gap-2"
        style={{
          background:
            wordStatus === "valid"
              ? "rgba(255,215,0,0.1)"
              : "rgba(255,255,255,0.03)",
          border: `2px solid ${
            wordStatus === "valid" ? "#d4af37" : "rgba(255,255,255,0.1)"
          }`,
          color: wordStatus === "valid" ? "#d4af37" : "#4b5563",
          cursor:
            wordStatus === "valid" && generateStatus !== "loading"
              ? "pointer"
              : "not-allowed",
          opacity: generateStatus === "loading" ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          if (wordStatus === "valid" && generateStatus !== "loading")
            e.currentTarget.style.filter = "brightness(1.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.filter = "brightness(1)";
        }}
      >
        <Link className="w-3.5 h-3.5" />
        {generateStatus === "loading"
          ? strings.CHALLENGE_FORM_GENERATING_BUTTON_TEXT
          : strings.CHALLENGE_FORM_GENERATE_BUTTON_TEXT}
      </button>
    </div>
  );
};
