import { useState, useEffect, useRef } from "react";
import { StatBar } from "../stats/StatBar";
import { Histogram } from "../stats/Histogram";
import { GameStats } from "../../lib/localStorage";
import { shareStatus, shareStats } from "../../lib/share";
import { BaseModal } from "./BaseModal";
import { ChallengeCreatorTab } from "./ChallengeCreatorTab";
import {
  Share2,
  RotateCcw,
  BookOpen,
  Hash,
  Target,
  Swords,
} from "lucide-react";
import {
  STATISTICS_TITLE,
  GUESS_DISTRIBUTION_TEXT,
} from "../../constants/strings";
import {
  HARD_MODE_MAX_CHALLENGES,
  NORMAL_MODE_MAX_CHALLENGES,
} from "../../constants/settings";
import {
  DICT_LABELS,
  DICT_DESCRIPTIONS,
  type ChallengeConfig,
  type ChallengeDict,
} from "../../lib/challenge";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  solution: string;
  guesses: string[];
  gameStats: GameStats;
  hardGameStats: GameStats;
  isGameLost: boolean;
  isGameWon: boolean;
  handleShareToClipboard: () => void;
  numberOfGuessesMade: number;
  handleNewGame: () => void;
  hardMode: boolean;
  challengeConfig?: ChallengeConfig | null;
  handleReturnToNormal?: () => void;
  extraEffects?: boolean;
  isDuelMode?: boolean;
  handleDuelReturn?: () => void;
  duelConfig?: import("../../lib/duel").DuelConfig | null;
  isActivityMode?: boolean;
};

const playSadTrombone = () => {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const r = () => Math.random();

    const reverbDuration = 2.8;
    const reverbBuffer = ctx.createBuffer(
      2,
      ctx.sampleRate * reverbDuration,
      ctx.sampleRate
    );
    for (let ch = 0; ch < 2; ch++) {
      const data = reverbBuffer.getChannelData(ch);
      for (let i = 0; i < data.length; i++) {
        data[i] =
          (r() * 2 - 1) *
          Math.pow(1 - i / data.length, 2.2 + r() * 0.4) *
          Math.exp((-i / ctx.sampleRate) * (2.6 + r() * 0.5));
      }
    }
    const reverb = ctx.createConvolver();
    reverb.buffer = reverbBuffer;

    const saturation = ctx.createWaveShaper();
    const curveLen = 512;
    const curve = new Float32Array(curveLen);
    for (let i = 0; i < curveLen; i++) {
      const x = (i * 2) / curveLen - 1;
      curve[i] = ((Math.PI + 38) * x) / (Math.PI + 38 * Math.abs(x));
    }
    saturation.curve = curve;
    saturation.oversample = "4x";

    const real = new Float32Array([
      0, 1, 0.65, 0.52, 0.28, 0.22, 0.14, 0.09, 0.06, 0.04,
    ]);
    const imag = new Float32Array(real.length);
    const brassWave = ctx.createPeriodicWave(real, imag, {
      disableNormalization: false,
    });

    const dryGain = ctx.createGain();
    dryGain.gain.setValueAtTime(0.22, ctx.currentTime);
    const wetGain = ctx.createGain();
    wetGain.gain.setValueAtTime(0.32, ctx.currentTime);

    saturation.connect(dryGain);
    saturation.connect(reverb);
    reverb.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);

    const notes = [
      { freq: 392, start: 0.0, dur: 0.65 },
      { freq: 349, start: 0.58, dur: 0.65 },
      { freq: 311, start: 1.16, dur: 0.65 },
      { freq: 261, start: 1.74, dur: 2.4 },
    ];

    notes.forEach(({ freq, start, dur }, i) => {
      const isLast = i === notes.length - 1;
      const timeJitter = i === 0 ? 0 : (r() - 0.5) * 0.04;
      const pitchJitter = 1 + (r() - 0.5) * 0.008;
      const t = start + timeJitter;

      const noiseBuffer = ctx.createBuffer(
        1,
        ctx.sampleRate * 0.09,
        ctx.sampleRate
      );
      const noiseData = noiseBuffer.getChannelData(0);
      for (let s = 0; s < noiseData.length; s++) noiseData[s] = r() * 2 - 1;
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.value = freq * (1.4 + r() * 0.2);
      noiseFilter.Q.value = 0.7 + r() * 0.3;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0, ctx.currentTime + t);
      noiseGain.gain.linearRampToValueAtTime(
        0.03 + r() * 0.015,
        ctx.currentTime + t + 0.012
      );
      noiseGain.gain.linearRampToValueAtTime(
        0.0,
        ctx.currentTime + t + 0.08 + r() * 0.02
      );
      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(saturation);
      noise.start(ctx.currentTime + t);

      const makeVoice = (detuneCents: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.setPeriodicWave(brassWave);
        const detunedFreq =
          freq * pitchJitter * Math.pow(2, detuneCents / 1200);
        osc.frequency.setValueAtTime(detunedFreq, ctx.currentTime + t);

        if (isLast) {
          osc.frequency.linearRampToValueAtTime(
            detunedFreq * (0.91 + r() * 0.015),
            ctx.currentTime + t + dur
          );

          const vibratoLfo = ctx.createOscillator();
          const vibratoGain = ctx.createGain();
          vibratoLfo.type = "sine";
          vibratoLfo.frequency.setValueAtTime(
            3.8 + r() * 0.8,
            ctx.currentTime + t
          );
          vibratoGain.gain.setValueAtTime(0.0, ctx.currentTime + t);
          vibratoGain.gain.linearRampToValueAtTime(
            detunedFreq * (0.007 + r() * 0.003),
            ctx.currentTime + t + 0.7
          );
          vibratoLfo.connect(vibratoGain);
          vibratoGain.connect(osc.frequency);
          vibratoLfo.start(ctx.currentTime + t);
          vibratoLfo.stop(ctx.currentTime + t + dur + 0.1);
        } else {
          osc.frequency.linearRampToValueAtTime(
            detunedFreq * (0.965 + r() * 0.01),
            ctx.currentTime + t + dur
          );
        }

        const noteGain = 0.1 + r() * 0.02;
        gain.gain.setValueAtTime(0.0, ctx.currentTime + t);
        gain.gain.linearRampToValueAtTime(
          noteGain,
          ctx.currentTime + t + 0.08 + r() * 0.02
        );
        gain.gain.setValueAtTime(noteGain, ctx.currentTime + t + dur - 0.14);
        gain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + t + dur);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1000 + r() * 200, ctx.currentTime + t);
        filter.frequency.linearRampToValueAtTime(
          isLast ? 360 + r() * 60 : 500 + r() * 80,
          ctx.currentTime + t + dur
        );
        filter.Q.setValueAtTime(1.6 + r() * 0.5, ctx.currentTime + t);

        if (isLast) {
          const tremolo = ctx.createGain();
          const lfo = ctx.createOscillator();
          lfo.type = "sine";
          lfo.frequency.setValueAtTime(2.8 + r() * 0.9, ctx.currentTime + t);
          const lfoGain = ctx.createGain();
          lfoGain.gain.setValueAtTime(0.0, ctx.currentTime + t);
          lfoGain.gain.linearRampToValueAtTime(
            0.11 + r() * 0.04,
            ctx.currentTime + t + 0.6
          );
          lfo.connect(lfoGain);
          lfoGain.connect(tremolo.gain);
          tremolo.gain.setValueAtTime(1.0, ctx.currentTime + t);
          lfo.start(ctx.currentTime + t);
          lfo.stop(ctx.currentTime + t + dur + 0.1);
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(tremolo);
          tremolo.connect(saturation);
        } else {
          osc.connect(filter);
          filter.connect(gain);
          gain.connect(saturation);
        }

        osc.start(ctx.currentTime + t);
        osc.stop(ctx.currentTime + t + dur + 0.1);
      };

      makeVoice(0);
      makeVoice(10);
    });

    const totalDur = 1.74 + 2.4 + 0.2;
    dryGain.gain.setValueAtTime(0.22, ctx.currentTime + totalDur - 0.4);
    dryGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + totalDur);
    wetGain.gain.setValueAtTime(0.32, ctx.currentTime + totalDur - 0.4);
    wetGain.gain.linearRampToValueAtTime(0.0, ctx.currentTime + totalDur + 1.4);

    setTimeout(() => {
      try {
        ctx.close();
      } catch {}
    }, (totalDur + 2.5) * 1000);
  } catch {}
};

const shareChallengeInvite = async (
  config: ChallengeConfig,
  handleShareToClipboard: () => void
) => {
  const text =
    `I'm challenging you to a custom Vagudle!\n` +
    `${config.length} letters · ${DICT_LABELS[config.dict]} dictionary · ${
      config.guesses
    } guesses\n` +
    `(Results won't affect your stats)\n` +
    window.location.href;

  try {
    if (
      typeof navigator.share === "function" &&
      navigator.canShare?.({ text })
    ) {
      await navigator.share({ title: "Vagudle Challenge", text });
      return;
    }
  } catch {}

  try {
    await navigator.clipboard.writeText(text);
    handleShareToClipboard();
  } catch {}
};

export const StatsModal = ({
  isOpen,
  handleClose,
  solution,
  guesses,
  gameStats,
  hardGameStats,
  isGameLost,
  isGameWon,
  handleShareToClipboard,
  numberOfGuessesMade,
  handleNewGame,
  hardMode,
  challengeConfig,
  handleReturnToNormal,
  extraEffects = true,
  isDuelMode = false,
  handleDuelReturn,
  duelConfig,
  isActivityMode = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<"normal" | "hard">(
    hardMode ? "hard" : "normal"
  );
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const hasPlayedSoundRef = useRef(false);

  useEffect(() => {
    if (isOpen) setShowChallengeCreator(false);
  }, [isOpen, solution]);

  useEffect(() => {
    if (isOpen && isGameLost && extraEffects && !hasPlayedSoundRef.current) {
      hasPlayedSoundRef.current = true;
      setTimeout(() => playSadTrombone(), 200);
    }
    if (!isOpen) {
      hasPlayedSoundRef.current = false;
    }
  }, [isOpen, isGameLost, extraEffects]);

  const displayStats = activeTab === "hard" ? hardGameStats : gameStats;
  const tabMaxChallenges =
    activeTab === "hard"
      ? HARD_MODE_MAX_CHALLENGES
      : NORMAL_MODE_MAX_CHALLENGES;
  const gameMaxChallenges = hardMode
    ? HARD_MODE_MAX_CHALLENGES
    : NORMAL_MODE_MAX_CHALLENGES;
  const isCurrentTab = activeTab === (hardMode ? "hard" : "normal");
  const hasGames = displayStats.totalGames > 0;

  const presetDict: ChallengeDict = hardMode ? "hard" : "normal";
  const presetGuesses: 9 | 11 = hardMode ? 9 : 11;

  const tabBase =
    "flex-1 py-2 font-pixel text-xs tracking-widest transition-all";
  const activeTabStyle = {
    background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
    border: "2px solid #5000aa",
    color: "#fff",
  };
  const inactiveTabStyle = {
    background: "rgba(255,255,255,0.03)",
    border: "2px solid rgba(255,255,255,0.1)",
    color: "#6b7280",
  };

  if (showChallengeCreator) {
    return (
      <BaseModal
        title="Create Challenge"
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <ChallengeCreatorTab
          autoFilledWord={solution}
          autoFilledDict={presetDict}
          autoFilledGuesses={presetGuesses}
          onBack={() => setShowChallengeCreator(false)}
        />
      </BaseModal>
    );
  }

  if (isDuelMode) {
    const score = isGameLost ? "X" : guesses.length;

    return (
      <BaseModal title="Duel Result" isOpen={isOpen} handleClose={handleClose}>
        <div
          className="p-3 mb-4 space-y-2"
          style={{
            background: "rgba(80,0,170,0.1)",
            border: "1px solid rgba(80,0,170,0.35)",
          }}
        >
          <p className="font-pixel text-xs text-crown-amber tracking-widest">
            DUEL
          </p>
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-code text-xs text-gray-300">
              {duelConfig?.length ?? solution.length} letters
            </span>
          </div>
          {duelConfig && (
            <>
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="font-code text-xs text-gray-300">
                  {DICT_LABELS[duelConfig.dict]} dictionary —{" "}
                  <span className="text-gray-500">
                    {DICT_DESCRIPTIONS[duelConfig.dict]}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="font-code text-xs text-gray-300">
                  {duelConfig.guesses} guesses allowed
                </span>
              </div>
            </>
          )}
        </div>

        {isGameWon && (
          <div className="text-center py-3">
            <p className="font-pixel text-xs text-tajin-lime tracking-widest">
              DUEL COMPLETE!
            </p>
            <p className="font-code text-sm text-gray-300 mt-1">
              Solved in{" "}
              <span className="text-crown-gold font-bold">{score}</span> guesses
            </p>
          </div>
        )}

        {isGameLost && (
          <div className="text-center py-3">
            <p className="font-pixel text-xs text-tajin-red tracking-widest">
              DUEL FAILED
            </p>
            <p className="font-code text-sm text-gray-400 mt-1">
              Better luck next time!
            </p>
          </div>
        )}

        {handleDuelReturn && (
          <div className="mt-3">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(255,255,255,0.12)",
                color: "#9ca3af",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
              onClick={handleDuelReturn}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              LEAVE
            </button>
          </div>
        )}
      </BaseModal>
    );
  }

  if (challengeConfig) {
    const score = isGameLost ? "X" : guesses.length;
    const maxG = challengeConfig.guesses;

    return (
      <BaseModal
        title="Challenge Result"
        isOpen={isOpen}
        handleClose={handleClose}
      >
        <div
          className="p-3 mb-4 space-y-2"
          style={{
            background: "rgba(80,0,170,0.1)",
            border: "1px solid rgba(80,0,170,0.35)",
          }}
        >
          <p className="font-pixel text-xs text-crown-amber tracking-widest">
            CUSTOM CHALLENGE
          </p>
          <div className="flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-code text-xs text-gray-300">
              {challengeConfig.length} letters
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-code text-xs text-gray-300">
              {DICT_LABELS[challengeConfig.dict]} dictionary —{" "}
              <span className="text-gray-500">
                {DICT_DESCRIPTIONS[challengeConfig.dict]}
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <span className="font-code text-xs text-gray-300">
              {challengeConfig.guesses} guesses allowed
            </span>
          </div>
        </div>

        {isGameWon && (
          <div className="text-center py-3">
            <p className="font-pixel text-xs text-tajin-lime tracking-widest">
              CHALLENGE COMPLETE!
            </p>
            <p className="font-code text-sm text-gray-300 mt-1">
              Solved in{" "}
              <span className="text-crown-gold font-bold">
                {score}/{maxG}
              </span>{" "}
              guesses
            </p>
          </div>
        )}

        {isGameLost && (
          <div className="text-center py-3">
            <p className="font-pixel text-xs text-tajin-red tracking-widest">
              CHALLENGE FAILED
            </p>
            <p className="font-code text-sm text-gray-400 mt-1">
              Better luck next time! You can always ask the sender for the
              answer.
            </p>
          </div>
        )}

        <div className="mt-3 grid grid-cols-2 gap-3">
          {handleReturnToNormal && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "2px solid rgba(255,255,255,0.12)",
                color: "#9ca3af",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
              onClick={handleReturnToNormal}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              LEAVE
            </button>
          )}

          {!isActivityMode && (
            <button
              type="button"
              className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
              style={{
                background: "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
                border: "2px solid #5000aa",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = "brightness(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = "brightness(1)";
              }}
              onClick={() =>
                shareChallengeInvite(challengeConfig, handleShareToClipboard)
              }
            >
              <Share2 className="w-3.5 h-3.5" />
              SHARE
            </button>
          )}
        </div>
      </BaseModal>
    );
  }

  return (
    <BaseModal
      title={STATISTICS_TITLE}
      isOpen={isOpen}
      handleClose={handleClose}
    >
      <div className="flex gap-2 mb-4">
        <button
          className={tabBase}
          style={activeTab === "normal" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("normal")}
        >
          NORMAL
        </button>
        <button
          className={tabBase}
          style={activeTab === "hard" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("hard")}
        >
          HARD
        </button>
      </div>

      {hasGames ? (
        <>
          <StatBar gameStats={displayStats} />

          <p className="font-pixel text-xs text-gray-500 tracking-widest mt-4 mb-3">
            {GUESS_DISTRIBUTION_TEXT.toUpperCase()}
          </p>

          <Histogram
            gameStats={displayStats}
            isGameWon={isGameWon && isCurrentTab}
            numberOfGuessesMade={numberOfGuessesMade}
            maxChallenges={tabMaxChallenges}
          />
        </>
      ) : (
        <div className="py-8 flex flex-col items-center gap-2">
          <p className="font-pixel text-xs text-crown-amber tracking-widest">
            NO GAMES YET
          </p>
          <p className="font-code text-xs text-gray-500 text-center">
            {activeTab === "hard"
              ? "Play a game in Hard Mode to see stats here."
              : "Play a game to see stats here."}
          </p>
        </div>
      )}

      {hasGames && !isActivityMode && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-2 font-pixel text-xs tracking-wider transition-all"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "1px solid rgba(255,215,0,0.25)",
              color: "#d4af37",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onClick={() =>
              shareStats(
                displayStats,
                activeTab === "hard",
                handleShareToClipboard
              )
            }
          >
            <Share2 className="w-3 h-3" />
            SHARE STATS
          </button>
        </div>
      )}

      {(isGameLost || isGameWon) && (
        <>
          <div
            className={`mt-3 ${isActivityMode ? "" : "grid grid-cols-2 gap-3"}`}
          >
            {!isActivityMode && (
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
                style={{
                  background:
                    "linear-gradient(180deg, #3a7d44 0%, #2d6135 100%)",
                  border: "2px solid #3a7d44",
                  color: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
                onClick={handleNewGame}
              >
                <RotateCcw className="w-3.5 h-3.5" />
                NEW GAME
              </button>
            )}

            {!isActivityMode && (
              <button
                type="button"
                className="flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
                style={{
                  background:
                    "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
                  border: "2px solid #5000aa",
                  color: "#fff",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.filter = "brightness(1.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = "brightness(1)";
                }}
                onClick={() =>
                  shareStatus(
                    solution,
                    guesses,
                    isGameLost,
                    handleShareToClipboard,
                    hardMode,
                    gameMaxChallenges
                  )
                }
              >
                <Share2 className="w-3.5 h-3.5" />
                SHARE GAME
              </button>
            )}
          </div>

          <button
            type="button"
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 font-pixel text-xs tracking-wider transition-all"
            style={{
              background: "rgba(255,215,0,0.06)",
              border: "2px solid rgba(255,215,0,0.35)",
              color: "#d4af37",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.filter = "brightness(1.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.filter = "brightness(1)";
            }}
            onClick={() => setShowChallengeCreator(true)}
          >
            <Swords className="w-3.5 h-3.5" />
            CHALLENGE OTHERS WITH THIS WORD
          </button>
        </>
      )}
    </BaseModal>
  );
};
