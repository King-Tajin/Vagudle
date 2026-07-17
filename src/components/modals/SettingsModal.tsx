import React, { useState, useEffect, useRef } from "react";
import { BookOpen, ChevronDown, Hash, Lock, Mail, Target } from "lucide-react";
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

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 flex-shrink-0" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.28A7.2 7.2 0 0 1 4.9 12c0-.79.14-1.56.37-2.28V6.63H1.29A11.98 11.98 0 0 0 0 12c0 1.94.47 3.77 1.29 5.37l3.98-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.34.6 4.58 1.79l3.43-3.43C17.94 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.63l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77z"
    />
  </svg>
);

const GithubIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="w-4 h-4 flex-shrink-0"
    aria-hidden="true"
  >
    <path d="M12 0C5.37 0 0 5.5 0 12.3c0 5.44 3.44 10.05 8.21 11.68.6.11.82-.27.82-.6 0-.29-.01-1.07-.02-2.1-3.34.75-4.04-1.65-4.04-1.65-.55-1.43-1.34-1.81-1.34-1.81-1.09-.77.08-.76.08-.76 1.2.09 1.84 1.26 1.84 1.26 1.07 1.87 2.81 1.33 3.5 1.02.11-.79.42-1.33.76-1.64-2.67-.31-5.47-1.37-5.47-6.1 0-1.35.47-2.45 1.24-3.31-.12-.31-.54-1.57.12-3.27 0 0 1.01-.33 3.3 1.26a11.2 11.2 0 0 1 6.01 0c2.29-1.59 3.3-1.26 3.3-1.26.66 1.7.24 2.96.12 3.27.77.86 1.24 1.96 1.24 3.31 0 4.74-2.81 5.78-5.49 6.08.43.38.81 1.13.81 2.28 0 1.65-.01 2.98-.01 3.38 0 .33.22.72.83.6C20.57 22.34 24 17.74 24 12.3 24 5.5 18.63 0 12 0z" />
  </svg>
);

const providerButtonStyle = {
  background: "rgba(255,255,255,0.05)",
  border: "2px solid #3a3a4a",
  color: "#d1d5db",
};

const CloudSaveSection = ({
  cloudUpdatedAt,
  isCloudUpToDate,
}: {
  cloudUpdatedAt: string | null;
  isCloudUpToDate: boolean;
}) => {
  const {
    user,
    authLoading,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    sendEmailLink,
    signOutUser,
  } = useCloudAuth();
  const [email, setEmail] = useState("");

  return (
    <div className="py-3">
      <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
        CLOUD SAVE
      </p>
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
            <GoogleIcon />
            CONTINUE WITH GOOGLE
          </button>
          <button
            type="button"
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GithubIcon />
            CONTINUE WITH GITHUB
          </button>
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
