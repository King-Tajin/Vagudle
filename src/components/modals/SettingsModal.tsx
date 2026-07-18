import React, { useState, useEffect, useRef } from "react";
import {
  AlertTriangle,
  BookOpen,
  ChevronDown,
  Hash,
  Lock,
  Mail,
  ShieldCheck,
  Target,
} from "lucide-react";
import GoogleIcon from "../../assets/icons/google.svg?react";
import GithubIcon from "../../assets/icons/github.svg?react";
import DiscordIcon from "../../assets/icons/discord.svg?react";
import { BaseModal } from "./BaseModal";
import { SettingsToggle } from "./SettingsToggle";
import { ChallengeCreatorModal } from "./ChallengeCreatorModal";
import { useCloudAuth } from "../../hooks/useCloudAuth";
import { formatRelativeTime } from "../../lib/cloudSync";
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
import { ACHIEVEMENTS } from "../../lib/achievements";

type Tab = "settings" | "challenge";

export type GameSettingsValues = {
  showGrayCount: boolean;
  hardMode: boolean;
  autoGray: boolean;
  autoGreen: boolean;
  extraEffects: boolean;
  backgroundId: BackgroundId;
};

export type GameSettingsHandlers = {
  setShowGrayCount: (value: boolean) => void;
  setHardMode: (value: boolean) => void;
  setAutoGray: (value: boolean) => void;
  setAutoGreen: (value: boolean) => void;
  setExtraEffects: (value: boolean) => void;
  setBackgroundId: (value: BackgroundId) => void;
};

type Props = {
  isOpen: boolean;
  handleClose: () => void;
  wordLength: number;
  hasStarted: boolean;
  onWordLengthChange: (length: number) => void;
  settings: GameSettingsValues;
  settingsHandlers: GameSettingsHandlers;
  unlockedAchievementIds: string[];
  isMobile?: boolean;
  challengeConfig?: ChallengeConfig | DuelConfig | null;
  isActivityMode?: boolean;
  cloudUpdatedAt?: string | null;
  isCloudUpToDate?: boolean;
};

const isBgUnlocked = (bg: BackgroundDef, unlockedIds: string[]) =>
  !bg.requiresAchievementId || unlockedIds.includes(bg.requiresAchievementId);

const getBgGroupRank = (bg: BackgroundDef, unlockedIds: string[]) => {
  if (isBgUnlocked(bg, unlockedIds)) return 0;
  const requiredAchievement = bg.requiresAchievementId
    ? ACHIEVEMENTS.find((a) => a.id === bg.requiresAchievementId)
    : undefined;
  return requiredAchievement?.hidden ? 2 : 1;
};

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
        type="button"
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
          {BACKGROUNDS.toSorted(
            (a, b) =>
              getBgGroupRank(a, unlockedIds) - getBgGroupRank(b, unlockedIds)
          ).map((bg) => {
            const unlocked = isBgUnlocked(bg, unlockedIds);
            const requiredAchievement = bg.requiresAchievementId
              ? ACHIEVEMENTS.find((a) => a.id === bg.requiresAchievementId)
              : undefined;
            const isHiddenLock =
              !unlocked && (requiredAchievement?.hidden ?? false);
            const bgLabel = isHiddenLock
              ? "???"
              : isMobile
                ? bg.mobileLabel
                : bg.desktopLabel;
            const isSelected = bg.id === currentId;

            return (
              <button
                type="button"
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

const providerButtonStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "2px solid #3a3a4a",
  color: "#d1d5db",
};

const CloudSaveSection = ({
  cloudUpdatedAt,
  isCloudUpToDate,
  isActivityMode,
}: {
  cloudUpdatedAt: string | null;
  isCloudUpToDate: boolean;
  isActivityMode: boolean;
}) => {
  const {
    user,
    authLoading,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    sendEmailLink,
    signOutUser,
  } = useCloudAuth();
  const [email, setEmail] = useState("");

  return (
    <div className="py-3">
      <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
        CLOUD SAVE
      </p>
      <div className="flex items-start gap-1.5 mb-2">
        <AlertTriangle
          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-crown-amber"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          Cloud save does not save games currently in progress.
        </p>
      </div>
      <div className="flex items-start gap-1.5 mb-2">
        <ShieldCheck
          className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-tajin-lime"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          Your data is never sold. Emails are only kept in case you need
          support.
        </p>
      </div>
      {authLoading ? (
        <p className="font-code text-xs text-gray-500">
          Checking sign-in status...
        </p>
      ) : user ? (
        <div className="space-y-2">
          <p className="font-code text-xs text-gray-300">
            Signed in as{" "}
            <span className="text-tajin-lime">
              {user.email ?? user.displayName ?? user.uid}
            </span>
          </p>
          <p className="font-code text-xs text-gray-500">
            {isCloudUpToDate ? (
              <span className="text-tajin-lime">Up to date</span>
            ) : (
              "Syncing..."
            )}
            {cloudUpdatedAt && (
              <> · Last saved {formatRelativeTime(cloudUpdatedAt)}</>
            )}
          </p>
          <button
            type="button"
            onClick={signOutUser}
            className="w-full font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            SIGN OUT
          </button>
          {actionError && (
            <p className="font-code text-xs text-tajin-red">{actionError}</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="font-code text-xs text-gray-500 leading-snug mb-1">
            Sign in to keep your stats, achievements, and settings synced across
            devices.
          </p>
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GoogleIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            CONTINUE WITH GOOGLE
          </button>
          <button
            type="button"
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GithubIcon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            CONTINUE WITH GITHUB
          </button>
          {!isActivityMode && (
            <button
              type="button"
              onClick={signInWithDiscord}
              className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <DiscordIcon
                className="w-4 h-4 flex-shrink-0"
                aria-hidden="true"
              />
              CONTINUE WITH DISCORD
            </button>
          )}
          <div className="flex gap-2 pt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 min-w-0 border-2 font-code text-xs p-2 outline-none focus-visible:ring-2 focus-visible:ring-crown-amber"
              style={{
                background: "#0a0014",
                borderColor: "#3a3a4a",
                color: "#d1d5db",
              }}
            />
            <button
              type="button"
              onClick={() => email && sendEmailLink(email)}
              className="flex-shrink-0 flex items-center gap-1.5 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              SEND LINK
            </button>
          </div>
          {emailLinkSent && (
            <p className="font-code text-xs text-tajin-lime">
              Check your email for a sign-in link.
            </p>
          )}
          {actionError && (
            <p className="font-code text-xs text-tajin-red">{actionError}</p>
          )}
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
  settings,
  settingsHandlers,
  unlockedAchievementIds,
  isMobile = false,
  challengeConfig,
  isActivityMode = false,
  cloudUpdatedAt = null,
  isCloudUpToDate = true,
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [settingsPage, setSettingsPage] = useState<1 | 2>(1);
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
    settingsHandlers.setHardMode(value);
  };

  return (
    <BaseModal title="Settings" isOpen={isOpen} handleClose={handleClose}>
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          className={tabBase}
          style={activeTab === "settings" ? activeTabStyle : inactiveTabStyle}
          onClick={() => setActiveTab("settings")}
        >
          SETTINGS
        </button>
        {!isActivityMode && (
          <button
            type="button"
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

          {settingsPage === 1 && (
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
                      <span className="font-pixel text-xs text-gray-500">
                        4
                      </span>
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
                          className="absolute top-1/2 transition-all duration-150 pointer-events-none w-[22px] h-[22px] rounded-full bg-[linear-gradient(180deg,#5000aa_0%,#28007c_100%)] border-2 border-[#7020cc] shadow-[0_0_8px_rgba(80,0,170,0.6)] z-[3]"
                          style={{
                            left: `${((wordLength - 4) / 3) * 100}%`,
                            transform: "translate(-50%, -50%)",
                          }}
                        />
                        <input
                          type="range"
                          min={4}
                          max={7}
                          step={1}
                          value={wordLength}
                          onChange={handleSliderChange}
                          aria-label="Word length"
                          className="absolute inset-0 w-full opacity-0 cursor-pointer"
                          style={{
                            height: 22,
                            top: "50%",
                            transform: "translateY(-50%)",
                            zIndex: 4,
                          }}
                        />
                      </div>
                      <span className="font-pixel text-xs text-gray-500">
                        7
                      </span>
                    </div>
                  </div>

                  <SettingsToggle
                    settingName="Hard Mode"
                    flag={settings.hardMode}
                    handleFlag={handleHardModeChange}
                    description="Only 9 tries to guess the uncommon English word."
                  />
                </>
              )}

              <SettingsToggle
                settingName="Show Gray Count"
                flag={settings.showGrayCount}
                handleFlag={settingsHandlers.setShowGrayCount}
                description="Show the number of gray (absent) letters next to each guess."
              />
              <SettingsToggle
                settingName="Auto Gray"
                flag={settings.autoGray}
                handleFlag={settingsHandlers.setAutoGray}
                description="Fully-gray rows auto-gray matching letters everywhere. Auto-grayed cells are protected and persist through resets."
              />
              <SettingsToggle
                settingName="Auto Green"
                flag={settings.autoGreen}
                handleFlag={settingsHandlers.setAutoGreen}
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
                  currentId={settings.backgroundId}
                  unlockedIds={unlockedAchievementIds}
                  isMobile={isMobile}
                  onChange={settingsHandlers.setBackgroundId}
                />
              </div>
            </div>
          )}

          {settingsPage === 2 && (
            <div className="flex flex-col divide-y divide-obsidian-700">
              <SettingsToggle
                settingName="Extra Sounds & Animations"
                flag={settings.extraEffects}
                handleFlag={settingsHandlers.setExtraEffects}
                description="Toggles win fireworks, a loss trombone, an achievement chest reveal, and video background audio."
              />
              <CloudSaveSection
                cloudUpdatedAt={cloudUpdatedAt}
                isCloudUpToDate={isCloudUpToDate}
                isActivityMode={isActivityMode}
              />
            </div>
          )}

          <div className="flex justify-center gap-2 pt-4">
            {([1, 2] as const).map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => setSettingsPage(page)}
                className="w-7 h-7 font-pixel text-xs flex items-center justify-center"
                style={
                  settingsPage === page ? activeTabStyle : inactiveTabStyle
                }
              >
                {page}
              </button>
            ))}
          </div>
        </>
      )}
      {activeTab === "challenge" && <ChallengeCreatorModal />}
    </BaseModal>
  );
};
