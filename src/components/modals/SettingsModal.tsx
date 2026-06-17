import React, { useState, useEffect, useRef } from "react";
import { BookOpen, ChevronDown, Hash, Lock, Target } from "lucide-react";
import { BaseModal } from "./BaseModal";
import { SettingsToggle } from "./SettingsToggle";
import { ChallengeCreatorTab } from "./ChallengeCreatorTab";
import {
  DICT_LABELS,
  DICT_DESCRIPTIONS,
  type ChallengeConfig,
} from "../../lib/challenge";
import type { DuelConfig } from "../../lib/duel";
import {
  BACKGROUNDS,
  type BackgroundId,
  type BackgroundDef,
} from "../../lib/backgrounds";

type Tab = "settings" | "challenge";

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  wordLength: number;
  hasStarted: boolean;
  onWordLengthChange: (length: number) => void;
  showGrayCount: boolean;
  setShowGrayCount: (value: boolean) => void;
  hardMode: boolean;
  setHardMode: (value: boolean) => void;
  autoGray: boolean;
  setAutoGray: (value: boolean) => void;
  autoGreen: boolean;
  setAutoGreen: (value: boolean) => void;
  extraEffects: boolean;
  setExtraEffects: (value: boolean) => void;
  backgroundId: BackgroundId;
  setBackgroundId: (value: BackgroundId) => void;
  unlockedAchievementIds: string[];
  isMobile?: boolean;
  challengeConfig?: ChallengeConfig | DuelConfig | null;
  isActivityMode?: boolean;
};

const isBgUnlocked = (bg: BackgroundDef, unlockedIds: string[]) =>
  !bg.requiresAchievementId || unlockedIds.includes(bg.requiresAchievementId);

const BackgroundDropdown = ({
  currentId,
  unlockedIds,
  isMobile,
  onChange,
}: {
  currentId: BackgroundId;
  unlockedIds: string[];
  isMobile: boolean;
  onChange: (id: BackgroundId) => void;
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = BACKGROUNDS.find((b) => b.id === currentId);
  const label = isMobile ? current?.mobileLabel : current?.desktopLabel;

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-pixel text-xs tracking-widest px-2.5 py-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: "#d4af37",
          cursor: "pointer",
          minWidth: 0,
        }}
      >
        {label}
        <ChevronDown className="w-3 h-3 flex-shrink-0 text-gray-500" />
      </button>

      {open && (
        <div
          className="absolute right-0 bottom-full mb-1 z-50"
          style={{
            background: "#0d1322",
            border: "2px solid #3a3a4a",
            whiteSpace: "nowrap",
            minWidth: "100%",
          }}
        >
          {BACKGROUNDS.map((bg) => {
            const unlocked = isBgUnlocked(bg, unlockedIds);
            const bgLabel = isMobile ? bg.mobileLabel : bg.desktopLabel;
            const isSelected = bg.id === currentId;

            return (
              <button
                key={bg.id}
                onClick={() => {
                  if (!unlocked) return;
                  onChange(bg.id);
                  setOpen(false);
                }}
                className="w-full text-left font-pixel text-xs tracking-widest px-3 py-2 flex items-center gap-2"
                style={{
                  color: !unlocked
                    ? "#374151"
                    : isSelected
                    ? "#d4af37"
                    : "#9ca3af",
                  textDecoration: !unlocked ? "line-through" : "none",
                  cursor: unlocked ? "pointer" : "default",
                  background:
                    isSelected && unlocked
                      ? "rgba(80,0,170,0.2)"
                      : "transparent",
                }}
              >
                {!unlocked && (
                  <Lock className="w-2.5 h-2.5 flex-shrink-0 text-gray-700" />
                )}
                {bgLabel}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const tabBase = "flex-1 py-2 font-pixel text-xs tracking-widest transition-all";
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

export const SettingsModal = ({
  isOpen,
  handleClose,
  wordLength,
  hasStarted,
  onWordLengthChange,
  showGrayCount,
  setShowGrayCount,
  hardMode,
  setHardMode,
  autoGray,
  setAutoGray,
  autoGreen,
  setAutoGreen,
  extraEffects,
  setExtraEffects,
  backgroundId,
  setBackgroundId,
  unlockedAchievementIds,
  isMobile = false,
  challengeConfig,
  isActivityMode = false,
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [errorMessage, setErrorMessage] = useState("");
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    };
  }, []);

  const showError = (msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMessage(msg);
    errorTimerRef.current = setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasStarted) {
      showError("Finish or start a new game before changing the word length!");
      return;
    }
    onWordLengthChange(Number(e.target.value));
  };

  const handleHardModeChange = (value: boolean) => {
    if (hasStarted) {
      showError("Finish or start a new game before changing difficulty!");
      return;
    }
    setHardMode(value);
  };

  return (
    <BaseModal title="Settings" isOpen={isOpen} handleClose={handleClose}>
      <div className="flex gap-2 mb-4">
        <button
          className={tabBase}
          style={activeTab === "settings" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("settings")}
        >
          SETTINGS
        </button>
        {!isActivityMode && (
          <button
            className={tabBase}
            style={
              activeTab === "challenge" ? activeTabStyle : inactiveTabStyle
            }
            onClick={() => setActiveTab("challenge")}
          >
            CHALLENGE
          </button>
        )}
      </div>

      {activeTab === "settings" && (
        <>
          {errorMessage && (
            <div
              className="mb-4 flex items-center gap-2 px-3 py-2"
              style={{
                background: "rgba(220,50,50,0.1)",
                border: "1px solid rgba(220,50,50,0.4)",
              }}
            >
              <span className="font-code text-xs text-tajin-red">
                {errorMessage}
              </span>
            </div>
          )}

          <div className="flex flex-col divide-y divide-obsidian-700">
            {challengeConfig ? (
              <div className="py-3 space-y-2">
                <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
                  CUSTOM CHALLENGE ACTIVE
                </p>
                <div
                  className="p-3 space-y-2"
                  style={{
                    background: "rgba(80,0,170,0.1)",
                    border: "1px solid rgba(80,0,170,0.35)",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Hash className="w-3.5 h-3.5 text-crown-amber flex-shrink-0" />
                    <span className="font-code text-xs text-gray-300">
                      {challengeConfig.length} letters
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-crown-amber flex-shrink-0" />
                    <span className="font-code text-xs text-gray-300">
                      {DICT_LABELS[challengeConfig.dict]} dictionary —{" "}
                      <span className="text-gray-500">
                        {DICT_DESCRIPTIONS[challengeConfig.dict]}
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-crown-amber flex-shrink-0" />
                    <span className="font-code text-xs text-gray-300">
                      {challengeConfig.guesses} guesses allowed
                    </span>
                  </div>
                </div>
                <p className="font-code text-xs text-gray-500 leading-snug">
                  Word length and difficulty are set by this challenge. Return
                  to normal Vagudle to change these.
                </p>
              </div>
            ) : (
              <>
                <div className="py-3">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-left">
                      <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
                        WORD LENGTH
                      </p>
                      <p className="font-code text-xs mt-1.5 text-gray-500">
                        Can be changed before your first guess:
                      </p>
                    </div>
                    <span className="font-pixel text-2xl text-tajin-lime w-10 text-center tabular-nums">
                      {wordLength}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 py-2">
                    <span className="font-pixel text-xs text-gray-500">4</span>
                    <div className="relative flex-1 h-2 mx-2.5">
                      <div
                        className="absolute inset-0"
                        style={{
                          background: "rgba(255,255,255,0.08)",
                          borderRadius: 4,
                        }}
                      />
                      {[5, 6].map((tick) => (
                        <div
                          key={tick}
                          className="absolute top-1/2 w-1.5 h-1.5"
                          style={{
                            left: `${((tick - 4) / 3) * 100}%`,
                            transform: "translate(-50%, -50%)",
                            background: "rgba(255,255,255,0.25)",
                            zIndex: 1,
                          }}
                        />
                      ))}
                      <div
                        className="absolute inset-y-0 left-0 transition-all duration-150"
                        style={{
                          width: `${((wordLength - 4) / 3) * 100}%`,
                          background:
                            "linear-gradient(90deg, #28007c, #5000aa)",
                          borderRadius: 4,
                          zIndex: 2,
                        }}
                      />
                      <div
                        className="absolute top-1/2 transition-all duration-150 pointer-events-none"
                        style={{
                          left: `${((wordLength - 4) / 3) * 100}%`,
                          transform: "translate(-50%, -50%)",
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background:
                            "linear-gradient(180deg, #5000aa 0%, #28007c 100%)",
                          border: "2px solid #7020cc",
                          boxShadow: "0 0 8px rgba(80,0,170,0.6)",
                          zIndex: 3,
                        }}
                      />
                      <input
                        type="range"
                        min={4}
                        max={7}
                        step={1}
                        value={wordLength}
                        onChange={handleSliderChange}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        style={{
                          height: 22,
                          top: "50%",
                          transform: "translateY(-50%)",
                          zIndex: 4,
                        }}
                      />
                    </div>
                    <span className="font-pixel text-xs text-gray-500">7</span>
                  </div>
                </div>

                <SettingsToggle
                  settingName="Hard Mode"
                  flag={hardMode}
                  handleFlag={handleHardModeChange}
                  description="Only 9 tries to guess the uncommon English word."
                />
              </>
            )}

            <SettingsToggle
              settingName="Show Gray Count"
              flag={showGrayCount}
              handleFlag={setShowGrayCount}
              description="Show the number of gray (absent) letters next to each guess."
            />
            <SettingsToggle
              settingName="Auto Gray"
              flag={autoGray}
              handleFlag={setAutoGray}
              description="Fully-gray rows auto-gray matching letters everywhere. Auto-grayed cells are protected and persist through resets."
            />
            <SettingsToggle
              settingName="Auto Green"
              flag={autoGreen}
              handleFlag={setAutoGreen}
              description="Painting a cell green auto-greens the same letter in that column. Changing a green cell clears those auto-greens."
            />

            <div className="flex justify-between gap-4 py-3">
              <div className="text-left mt-1">
                <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
                  BACKGROUND
                </p>
                <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
                  Choose your background style. New ones unlock via
                  achievements.
                </p>
              </div>
              <BackgroundDropdown
                currentId={backgroundId}
                unlockedIds={unlockedAchievementIds}
                isMobile={isMobile}
                onChange={setBackgroundId}
              />
            </div>

            <SettingsToggle
              settingName="Extra Sounds & Animations"
              flag={extraEffects}
              handleFlag={setExtraEffects}
              description="Play a firework celebration on wins and a sad sound effect on losses. Also toggles audio on backgrounds that support it."
            />
          </div>
        </>
      )}

      {activeTab === "challenge" && <ChallengeCreatorTab />}
    </BaseModal>
  );
};
