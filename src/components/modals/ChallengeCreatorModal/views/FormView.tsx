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
            Could not auto-generate link. Edit the settings below or try again.
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
          <span className="text-crown-amber">NOTE:</span> The chosen dictionary
          has little effect on gameplay. It simply lets the player know the
          popularity of the word.
        </p>
      </div>
      <div>
        <label
          htmlFor="challenge-dictionary"
          className="font-pixel text-xs text-crown-amber tracking-widest mb-2 block"
        >
          DICTIONARY
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
          YOUR WORD
        </p>
        <div className="relative">
          <input
            type="text"
            value={wordInput}
            onChange={onInput}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            maxLength={7}
            placeholder="Type a word (4–7 letters)..."
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
            Word must be 4–7 letters.
          </p>
        )}

        {wordStatus === "invalid-word" && (
          <>
            <p className="font-code text-xs text-spice-red mt-1">
              "{cleanInput}" isn't in the {DICT_LABELS[dict].toLowerCase()}{" "}
              dictionary.
            </p>
            {dictHints.foundIn && (
              <p
                className="font-code text-xs mt-1"
                style={{ color: "#a78bfa" }}
              >
                However, it is available in{" "}
                {DICT_LABELS[dictHints.foundIn].toLowerCase()} dictionary
                though. Switch dictionaries to use it.
              </p>
            )}
          </>
        )}

        {wordStatus === "valid" && (
          <>
            <p className="font-code text-xs text-green-400 mt-1">
              "{cleanInput}" is valid — {cleanInput.length} letters.
            </p>
            {dictHints.easierThan && (
              <p
                className="font-code text-xs mt-1"
                style={{ color: "#facc15" }}
              >
                Heads up: this word also appears in the{" "}
                {DICT_LABELS[dictHints.easierThan].toLowerCase()} dictionary,
                switching the dictionary provides the player with more precise
                information about the word's popularity.
              </p>
            )}
          </>
        )}

        {wordStatus === "idle" && (
          <p className="font-code text-xs text-gray-500 mt-1">
            Must be in the {DICT_LABELS[dict].toLowerCase()} dictionary.
          </p>
        )}
      </div>
      <div className="border-t border-obsidian-700" />
      <div>
        <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
          GUESSES ALLOWED
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
        ⚠ Challenge results do not count toward the recipient's stats. ⚠
      </p>
      {generateStatus === "error" && !hasAutoFilledWord && (
        <p className="font-code text-xs text-spice-red">
          Failed to generate link. Check your connection and try again.
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
        {generateStatus === "loading" ? "GENERATING..." : "GENERATE LINK"}
      </button>
    </div>
  );
};
