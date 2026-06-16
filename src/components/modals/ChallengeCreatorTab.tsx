import React, { useState, useEffect, useRef } from "react";
import {
  Copy,
  Check,
  Link,
  AlertCircle,
  CheckCircle,
  Share2,
  Info,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import {
  encodeChallenge,
  buildChallengeUrl,
  DICT_LABELS,
  DICT_DESCRIPTIONS,
  type ChallengeDict,
  type ChallengeConfig,
} from "../../lib/challenge";
import { isWordInDict } from "../../lib/words";

type ButtonGroupProps<T extends string | number> = {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
};

function ButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
}: ButtonGroupProps<T>) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            onClick={() => onChange(opt.value)}
            className="flex items-center justify-center px-3 py-2 font-pixel text-xs tracking-widest transition-all flex-1"
            style={{
              background: active
                ? "linear-gradient(180deg, #5000aa 0%, #28007c 100%)"
                : "rgba(255,255,255,0.04)",
              border: `2px solid ${
                active ? "#7020cc" : "rgba(255,255,255,0.1)"
              }`,
              color: active ? "#fff" : "#6b7280",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const GUESSES_OPTIONS = [
  { value: 9 as const, label: "9" },
  { value: 11 as const, label: "11" },
];

const DICT_ORDER: ChallengeDict[] = ["normal", "hard", "full"];

type WordStatus = "idle" | "valid" | "invalid-word" | "invalid-length";
type Generated = { word: string; url: string; config: ChallengeConfig };
type GenerateStatus = "idle" | "loading" | "error";

interface DictHint {
  foundIn: ChallengeDict | null;
  easierThan: ChallengeDict | null;
}

const getDictHints = (word: string, selected: ChallengeDict): DictHint => {
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

const shareChallenge = async (generated: Generated, onCopied: () => void) => {
  const { config, url } = generated;
  const text =
    `I'm challenging you to a custom Vagudle!\n` +
    `${config.length} letters · ${DICT_LABELS[config.dict]} dictionary · ${
      config.guesses
    } guesses\n` +
    `(Results won't affect your stats)\n` +
    url;

  try {
    if (
      typeof navigator.share === "function" &&
      navigator.canShare?.({ text })
    ) {
      await navigator.share({ title: "Vagudle Challenge", text });
      return;
    }
  } catch {}

  await navigator.clipboard.writeText(text);
  onCopied();
};

type Props = {
  autoFilledWord?: string;
  autoFilledDict?: ChallengeDict;
  autoFilledGuesses?: 9 | 11;
  onBack?: () => void;
};

export const ChallengeCreatorTab = ({
  autoFilledWord,
  autoFilledDict,
  autoFilledGuesses,
  onBack,
}: Props = {}) => {
  const [dict, setDict] = useState<ChallengeDict>(autoFilledDict ?? "normal");
  const [guesses, setGuesses] = useState<9 | 11>(autoFilledGuesses ?? 11);
  const [wordInput, setWordInput] = useState(autoFilledWord ?? "");
  const [wordStatus, setWordStatus] = useState<WordStatus>("idle");
  const [dictHints, setDictHints] = useState<DictHint>({
    foundIn: null,
    easierThan: null,
  });
  const [generated, setGenerated] = useState<Generated | null>(null);
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [generateStatus, setGenerateStatus] = useState<GenerateStatus>("idle");
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
    const w = autoFilledWord.toUpperCase().replace(/[^A-Z]/g, "");
    const d = autoFilledDict ?? "normal";
    const g = autoFilledGuesses ?? 11;

    setWordInput(w);
    setDict(d);
    setGuesses(g);

    if (w.length < 4 || w.length > 7) {
      setWordStatus("invalid-length");
      return;
    }

    if (isWordInDict(w, d)) {
      setWordStatus("valid");
      setDictHints(getDictHints(w, d));
      const config: Omit<ChallengeConfig, "id"> = {
        word: w,
        dict: d,
        guesses: g,
        length: w.length,
      };
      setGenerateStatus("loading");
      void encodeChallenge(config).then((result) => {
        if (!result) {
          setGenerateStatus("error");
          return;
        }
        const fullConfig: ChallengeConfig = { ...config, id: result.id };
        setGenerated({
          word: w,
          url: buildChallengeUrl(result.encoded),
          config: fullConfig,
        });
        setGenerateStatus("idle");
      });
    } else {
      setWordStatus("invalid-word");
      setDictHints(getDictHints(w, d));
    }
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
    setGenerated(null);
    setGenerateStatus("idle");
    setCopied(false);
    setShared(false);
    if (cleanInput.length > 0) validateWord(cleanInput, next);
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^a-zA-Z]/g, "");
    setWordInput(raw);
    setGenerated(null);
    setGenerateStatus("idle");
    setCopied(false);
    setShared(false);
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

  const generate = async () => {
    if (wordStatus !== "valid") {
      validateWord(cleanInput, dict, true);
      return;
    }
    setGenerateStatus("loading");
    const config: Omit<ChallengeConfig, "id"> = {
      word: cleanInput,
      dict,
      guesses,
      length: cleanInput.length,
    };
    const result = await encodeChallenge(config);
    if (!result) {
      setGenerateStatus("error");
      return;
    }
    const fullConfig: ChallengeConfig = { ...config, id: result.id };
    setGenerated({
      word: cleanInput,
      url: buildChallengeUrl(result.encoded),
      config: fullConfig,
    });
    setGenerateStatus("idle");
    setCopied(false);
    setShared(false);
  };

  const copyLink = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.url);
      setCopied(true);
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
      copiedTimerRef.current = setTimeout(() => setCopied(false), 2500);
    } catch {}
  };

  const handleShare = async () => {
    if (!generated) return;
    await shareChallenge(generated, () => {
      setShared(true);
      if (sharedTimerRef.current) clearTimeout(sharedTimerRef.current);
      sharedTimerRef.current = setTimeout(() => setShared(false), 2500);
    });
  };

  const handleEdit = () => {
    setGenerated(null);
    setCopied(false);
    setShared(false);
  };

  const borderColor: Record<WordStatus, string> = {
    idle: "rgba(255,255,255,0.1)",
    valid: "#4a7c3f",
    "invalid-word": "#dc3232",
    "invalid-length": "#dc3232",
  };

  if (generateStatus === "loading" && autoFilledWord && !generated) {
    return (
      <div className="space-y-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-pixel text-xs tracking-widest transition-all"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <ArrowLeft className="w-3 h-3" />
            BACK TO STATS
          </button>
        )}
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="w-6 h-6 text-crown-amber animate-spin" />
          <p className="font-pixel text-xs text-gray-500 tracking-widest">
            GENERATING LINK...
          </p>
        </div>
      </div>
    );
  }

  if (generated) {
    return (
      <div className="space-y-3">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-pixel text-xs tracking-widest transition-all"
            style={{ color: "#6b7280" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <ArrowLeft className="w-3 h-3" />
            BACK TO STATS
          </button>
        )}
        <div
          className="p-3"
          style={{
            background: "rgba(80,0,170,0.12)",
            border: "1px solid rgba(80,0,170,0.4)",
          }}
        >
          <p className="font-pixel text-[9px] text-gray-500 tracking-widest mb-1">
            CHALLENGE READY
          </p>
          <p className="font-pixel text-xl text-crown-gold tracking-widest crown-glow">
            {generated.word}
          </p>
          <div className="flex gap-3 mt-2">
            <span className="font-code text-xs text-gray-400">
              {generated.word.length} letters
            </span>
            <span className="font-code text-xs text-gray-600">·</span>
            <span className="font-code text-xs text-gray-400">
              {DICT_LABELS[dict]}
            </span>
            <span className="font-code text-xs text-gray-600">·</span>
            <span className="font-code text-xs text-gray-400">
              {guesses} guesses
            </span>
          </div>
        </div>

        <div
          className="px-3 py-2"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <p className="font-code text-xs text-gray-400 truncate">
            {generated.url}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={copyLink}
            className="flex-1 py-2.5 font-pixel text-xs tracking-widest flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: copied
                ? "rgba(74,124,63,0.2)"
                : "rgba(255,215,0,0.1)",
              border: `2px solid ${copied ? "#4a7c3f" : "#d4af37"}`,
              color: copied ? "#4ade80" : "#d4af37",
            }}
          >
            {copied ? (
              <>
                <Check className="w-3 h-3" />
                COPIED!
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                COPY
              </>
            )}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 py-2.5 font-pixel text-xs tracking-widest flex items-center justify-center gap-1.5 transition-all"
            style={{
              background: shared
                ? "rgba(74,124,63,0.2)"
                : "rgba(80,0,170,0.15)",
              border: `2px solid ${shared ? "#4a7c3f" : "#5000aa"}`,
              color: shared ? "#4ade80" : "#a78bfa",
            }}
          >
            {shared ? (
              <>
                <Check className="w-3 h-3" />
                SHARED!
              </>
            ) : (
              <>
                <Share2 className="w-3 h-3" />
                SHARE
              </>
            )}
          </button>

          <button
            onClick={handleEdit}
            className="px-4 py-2.5 font-pixel text-xs tracking-widest transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "2px solid rgba(255,255,255,0.1)",
              color: "#6b7280",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)";
              e.currentTarget.style.color = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            EDIT
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-pixel text-xs tracking-widest transition-all"
          style={{ color: "#6b7280" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#9ca3af";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <ArrowLeft className="w-3 h-3" />
          BACK TO STATS
        </button>
      )}

      {generateStatus === "error" && autoFilledWord && (
        <div
          className="p-3"
          style={{
            background: "rgba(220,50,50,0.08)",
            border: "1px solid rgba(220,50,50,0.3)",
          }}
        >
          <p className="font-code text-xs text-tajin-red">
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
        <Info className="w-3.5 h-3.5 text-crown-amber flex-shrink-0 mt-0.5" />
        <p className="font-code text-xs text-gray-400 leading-relaxed">
          <span className="text-crown-amber">NOTE:</span> The chosen dictionary
          has little effect on gameplay. It simply lets the player know the
          popularity of the word.
        </p>
      </div>

      <div>
        <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
          DICTIONARY
        </p>
        <select
          value={dict}
          onChange={handleDictChange}
          className="w-full border-2 font-code text-sm p-2 outline-none transition-colors"
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
        <p className="font-pixel text-xs text-crown-amber tracking-widest mb-2">
          YOUR WORD
        </p>
        <div className="relative">
          <input
            type="text"
            value={wordInput}
            onChange={handleInput}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            maxLength={7}
            placeholder="Type a word (4–7 letters)..."
            className="w-full border-2 font-pixel text-sm p-2 pr-8 outline-none tracking-widest uppercase"
            style={{
              background: "#0a0014",
              borderColor: borderColor[wordStatus],
              color: wordStatus === "valid" ? "#4ade80" : "#d1d5db",
              letterSpacing: "0.15em",
            }}
          />
          {wordStatus === "valid" && (
            <CheckCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
          )}
          {(wordStatus === "invalid-word" ||
            wordStatus === "invalid-length") && (
            <AlertCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-tajin-red" />
          )}
        </div>

        {wordStatus === "invalid-length" && (
          <p className="font-code text-xs text-tajin-red mt-1">
            Word must be 4–7 letters.
          </p>
        )}

        {wordStatus === "invalid-word" && (
          <>
            <p className="font-code text-xs text-tajin-red mt-1">
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
          onChange={(v) => {
            setGuesses(v);
            setGenerated(null);
          }}
        />
      </div>

      <div className="border-t border-obsidian-700" />

      <p
        className="font-code text-xs leading-snug"
        style={{ color: "rgba(212,175,55,0.6)" }}
      >
        ⚠ Challenge results do not count toward the recipient's stats. ⚠
      </p>

      {generateStatus === "error" && !autoFilledWord && (
        <p className="font-code text-xs text-tajin-red">
          Failed to generate link. Check your connection and try again.
        </p>
      )}

      <button
        onClick={generate}
        disabled={wordStatus !== "valid" || generateStatus === "loading"}
        className="w-full py-3 font-pixel text-xs tracking-widest transition-all flex items-center justify-center gap-2"
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
