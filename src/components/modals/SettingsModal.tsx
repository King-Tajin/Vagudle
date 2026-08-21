import React, {
  useState,
  useEffect,
  useEffectEvent,
  useRef,
  useMemo,
} from "react";
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
import PlayGamesIcon from "../../assets/icons/playgames.svg?react";
import { BaseModal } from "./BaseModal";
import { SettingsToggle } from "./SettingsToggle";
import { ChallengeCreatorModal } from "./ChallengeCreatorModal";
import { useCloudAuth, isPlayGamesAvailable } from "../../hooks/useCloudAuth";
import {
  getStoredPlayGamesSession,
  openPlayGamesLinkFlow,
} from "../../lib/playGamesCloudAuth";
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
import {
  fetchActivityLinkUrl,
  checkActivityAccountStatus,
  openExternalLink,
} from "../../lib/discord";
import {
  MODAL_TITLE_SETTINGS,
  SETTINGS_HARD_MODE_LABEL,
  SETTINGS_HARD_MODE_DESCRIPTION,
  SETTINGS_SHOW_GRAY_COUNT_LABEL,
  SETTINGS_SHOW_GRAY_COUNT_DESCRIPTION,
  SETTINGS_AUTO_GRAY_LABEL,
  SETTINGS_AUTO_GRAY_DESCRIPTION,
  SETTINGS_AUTO_GREEN_LABEL,
  SETTINGS_AUTO_GREEN_DESCRIPTION,
  SETTINGS_EXTRA_EFFECTS_LABEL,
  SETTINGS_EXTRA_EFFECTS_DESCRIPTION,
  SETTINGS_BACKGROUND_LABEL,
  SETTINGS_BACKGROUND_DESCRIPTION_FREE,
  SETTINGS_BACKGROUND_DESCRIPTION_LOCKED,
  SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL,
  SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION,
  SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL,
  SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION,
  SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL,
  SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION,
  SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX,
} from "../../constants/strings";
import {
  ENABLE_NOTIFICATION_SETTINGS,
  INACTIVITY_NUDGE_MIN_DAYS,
  INACTIVITY_NUDGE_MAX_DAYS,
} from "../../constants/settings";

type Tab = "settings" | "challenge";

export type GameSettingsValues = {
  showGrayCount: boolean;
  hardMode: boolean;
  autoGray: boolean;
  autoGreen: boolean;
  extraEffects: boolean;
  backgroundId: BackgroundId;
  dailyStreakRemindersEnabled: boolean;
  customReminderTimeEnabled: boolean;
  customReminderHour: number;
  customReminderMinute: number;
  customReminderPeriod: "AM" | "PM";
  inactivityReminderEnabled: boolean;
  inactivityReminderDays: number;
};

export type GameSettingsHandlers = {
  setShowGrayCount: (value: boolean) => void;
  setHardMode: (value: boolean) => void;
  setAutoGray: (value: boolean) => void;
  setAutoGreen: (value: boolean) => void;
  setExtraEffects: (value: boolean) => void;
  setBackgroundId: (value: BackgroundId) => void;
  setDailyStreakRemindersEnabled: (value: boolean) => void;
  setCustomReminderTimeEnabled: (value: boolean) => void;
  setCustomReminderHour: (value: number) => void;
  setCustomReminderMinute: (value: number) => void;
  setCustomReminderPeriod: (value: "AM" | "PM") => void;
  setInactivityReminderEnabled: (value: boolean) => void;
  setInactivityReminderDays: (value: number) => void;
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
  freeBackgroundsMode?: boolean;
  activityAccessToken?: string | null;
  cloudUpdatedAt?: string | null;
  isCloudUpToDate?: boolean;
  showPlayGamesLinkPrompt?: boolean;
  dismissPlayGamesLinkPrompt?: () => void;
  jumpToAccountKey?: number;
  jumpToBackgroundKey?: number;
};

const isBgUnlocked = (
  bg: BackgroundDef,
  unlockedIds: string[],
  freeBackgroundsMode: boolean
) =>
  freeBackgroundsMode ||
  !bg.requiresAchievementId ||
  unlockedIds.includes(bg.requiresAchievementId);

const getBgGroupRank = (
  bg: BackgroundDef,
  unlockedIds: string[],
  freeBackgroundsMode: boolean
) => {
  if (isBgUnlocked(bg, unlockedIds, freeBackgroundsMode)) return 0;
  const requiredAchievement = bg.requiresAchievementId
    ? ACHIEVEMENTS.find((a) => a.id === bg.requiresAchievementId)
    : undefined;
  return requiredAchievement?.hidden ? 2 : 1;
};

const BackgroundDropdown = ({
  currentId,
  unlockedIds,
  isMobile,
  freeBackgroundsMode,
  isOpen,
  onOpenChange,
  onChange,
}: {
  currentId: BackgroundId;
  unlockedIds: string[];
  isMobile: boolean;
  freeBackgroundsMode: boolean;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (id: BackgroundId) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const current = BACKGROUNDS.find((b) => b.id === currentId);
  const label = isMobile ? current?.mobileLabel : current?.desktopLabel;

  const handleOutsideClick = useEffectEvent(() => onOpenChange(false));

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        handleOutsideClick();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
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
        <ChevronDown className="w-3 h-3 shrink-0 text-gray-500" />
      </button>
      {isOpen && (
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
              getBgGroupRank(a, unlockedIds, freeBackgroundsMode) -
              getBgGroupRank(b, unlockedIds, freeBackgroundsMode)
          ).map((bg) => {
            const unlocked = isBgUnlocked(bg, unlockedIds, freeBackgroundsMode);
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
                  onOpenChange(false);
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
                  <Lock className="w-2.5 h-2.5 shrink-0 text-gray-700" />
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

type DropdownOption = { value: string; label: string };

const CompactDropdown = ({
  value,
  options,
  disabled = false,
  onChange,
  ariaLabel,
}: {
  value: string;
  options: DropdownOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
  ariaLabel: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value);

  const handleOutsideClick = useEffectEvent(() => setIsOpen(false));

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        handleOutsideClick();
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 font-pixel text-xs tracking-widest px-2.5 py-2"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: disabled ? "#4b5563" : "#d4af37",
          cursor: disabled ? "not-allowed" : "pointer",
          minWidth: 0,
        }}
      >
        {current?.label ?? value}
        <ChevronDown className="w-3 h-3 shrink-0 text-gray-500" />
      </button>
      {isOpen && !disabled && (
        <div
          className="absolute left-0 bottom-full mb-1 z-50"
          style={{
            background: "#0d1322",
            border: "2px solid #3a3a4a",
            whiteSpace: "nowrap",
            minWidth: "100%",
            maxHeight: "12rem",
            overflowY: "auto",
            overflowX: "hidden",
          }}
        >
          {options.map((opt) => {
            const isSelected = opt.value === value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className="w-full text-left font-pixel text-xs tracking-widest px-3 py-2 flex items-center gap-2"
                style={{
                  color: isSelected ? "#d4af37" : "#9ca3af",
                  cursor: "pointer",
                  background: isSelected ? "rgba(80,0,170,0.2)" : "transparent",
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const HOUR_OPTIONS: DropdownOption[] = Array.from(
  { length: 12 },
  (_, i) => i + 1
).map((h) => ({ value: String(h), label: String(h).padStart(2, "0") }));

const MINUTE_OPTIONS: DropdownOption[] = Array.from(
  { length: 12 },
  (_, i) => i * 5
).map((m) => ({ value: String(m), label: String(m).padStart(2, "0") }));

const PERIOD_OPTIONS: DropdownOption[] = [
  { value: "AM", label: "AM" },
  { value: "PM", label: "PM" },
];

const NotificationTimePicker = ({
  hour,
  minute,
  period,
  disabled = false,
  onHourChange,
  onMinuteChange,
  onPeriodChange,
}: {
  hour: number;
  minute: number;
  period: "AM" | "PM";
  disabled?: boolean;
  onHourChange: (value: number) => void;
  onMinuteChange: (value: number) => void;
  onPeriodChange: (value: "AM" | "PM") => void;
}) => {
  return (
    <div
      className="flex items-center gap-1.5"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <CompactDropdown
        value={String(hour)}
        options={HOUR_OPTIONS}
        disabled={disabled}
        onChange={(v) => onHourChange(Number(v))}
        ariaLabel="Reminder hour"
      />
      <span className="font-pixel text-xs text-gray-500">:</span>
      <CompactDropdown
        value={String(minute)}
        options={MINUTE_OPTIONS}
        disabled={disabled}
        onChange={(v) => onMinuteChange(Number(v))}
        ariaLabel="Reminder minute"
      />
      <CompactDropdown
        value={period}
        options={PERIOD_OPTIONS}
        disabled={disabled}
        onChange={(v) => onPeriodChange(v as "AM" | "PM")}
        ariaLabel="Reminder AM or PM"
      />
    </div>
  );
};

const clampInactivityDays = (n: number) =>
  Math.min(INACTIVITY_NUDGE_MAX_DAYS, Math.max(INACTIVITY_NUDGE_MIN_DAYS, n));

const InactivityDaysInput = ({
  value,
  disabled = false,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) => {
  const atMin = value <= INACTIVITY_NUDGE_MIN_DAYS;
  const atMax = value >= INACTIVITY_NUDGE_MAX_DAYS;

  return (
    <div
      className="flex items-center gap-1.5"
      style={{ opacity: disabled ? 0.5 : 1 }}
    >
      <button
        type="button"
        disabled={disabled || atMin}
        onClick={() => onChange(clampInactivityDays(value - 1))}
        aria-label="Decrease days"
        className="w-7 h-7 font-pixel text-sm flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: disabled || atMin ? "#4b5563" : "#d4af37",
          cursor: disabled || atMin ? "not-allowed" : "pointer",
        }}
      >
        −
      </button>
      <span
        className="font-pixel text-xs tracking-widest px-3 py-1.5 text-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: "#d4af37",
          minWidth: "2.5rem",
        }}
      >
        {value}
      </span>
      <button
        type="button"
        disabled={disabled || atMax}
        onClick={() => onChange(clampInactivityDays(value + 1))}
        aria-label="Increase days"
        className="w-7 h-7 font-pixel text-sm flex items-center justify-center"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "2px solid #3a3a4a",
          color: disabled || atMax ? "#4b5563" : "#d4af37",
          cursor: disabled || atMax ? "not-allowed" : "pointer",
        }}
      >
        +
      </button>
      <span className="font-code text-xs text-gray-500">
        {SETTINGS_NOTIFICATIONS_INACTIVITY_DAYS_SUFFIX}
      </span>
    </div>
  );
};

const ActivityLinkSection = ({
  accessToken,
}: {
  accessToken: string | null;
}) => {
  const [mode, setMode] = useState<"idle" | "linking" | "waiting" | "error">(
    "idle"
  );
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(
    () => () => {
      if (pollRef.current) clearInterval(pollRef.current);
    },
    []
  );

  const handleLink = async () => {
    if (!accessToken) return;
    setMode("linking");
    const url = await fetchActivityLinkUrl(accessToken);
    if (!url) {
      setMode("error");
      return;
    }
    openExternalLink(url);
    setMode("waiting");

    pollRef.current = setInterval(() => {
      void (async () => {
        const resolved = await checkActivityAccountStatus(accessToken);
        if (resolved) {
          if (pollRef.current) clearInterval(pollRef.current);
          window.location.reload();
        }
      })();
    }, 2500);
  };

  return (
    <div className="space-y-2">
      <p className="font-code text-xs text-gray-300">
        Auto signed in via Discord.
      </p>
      {mode === "waiting" ? (
        <p className="font-code text-xs text-gray-500 leading-snug">
          Waiting for you to finish linking in your browser...
        </p>
      ) : (
        <button
          type="button"
          onClick={() => void handleLink()}
          disabled={mode === "linking" || !accessToken}
          className="w-full font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
          style={providerButtonStyle}
        >
          {mode === "linking" ? "OPENING LINK..." : "LINK EXISTING ACCOUNT"}
        </button>
      )}
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          Could not start linking. Please try again.
        </p>
      )}
    </div>
  );
};

const PlayGamesLinkPrompt = ({ onDismiss }: { onDismiss: () => void }) => {
  const [mode, setMode] = useState<"idle" | "opening" | "error">("idle");

  const handleLink = async () => {
    const session = getStoredPlayGamesSession();
    if (!session) {
      setMode("error");
      return;
    }
    setMode("opening");
    const result = await openPlayGamesLinkFlow(session);
    if ("error" in result) {
      setMode("error");
      return;
    }
    onDismiss();
  };

  return (
    <div className="space-y-2 mb-3 p-3" style={providerButtonStyle}>
      <p className="font-code text-xs text-gray-300 leading-snug">
        Have an existing Vagudle account? Link it so your progress carries over.
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void handleLink()}
          disabled={mode === "opening"}
          className="flex-1 font-pixel text-xs tracking-widest px-3 py-2 disabled:opacity-40"
          style={providerButtonStyle}
        >
          {mode === "opening" ? "OPENING..." : "LINK ACCOUNT"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="flex-1 font-pixel text-xs tracking-widest px-3 py-2"
          style={providerButtonStyle}
        >
          SKIP
        </button>
      </div>
      {mode === "error" && (
        <p className="font-code text-xs text-spice-red leading-snug">
          Could not start linking. Please try again.
        </p>
      )}
    </div>
  );
};

const CloudSaveSection = ({
  cloudUpdatedAt,
  isCloudUpToDate,
  isActivityMode,
  activityAccessToken,
  showPlayGamesLinkPrompt,
  dismissPlayGamesLinkPrompt,
}: {
  cloudUpdatedAt: string | null;
  isCloudUpToDate: boolean;
  isActivityMode: boolean;
  activityAccessToken: string | null;
  showPlayGamesLinkPrompt: boolean;
  dismissPlayGamesLinkPrompt: () => void;
}) => {
  const {
    user,
    authLoading,
    actionError,
    emailLinkSent,
    signInWithGoogle,
    signInWithGithub,
    signInWithDiscord,
    signInWithPlayGames,
    sendEmailLink,
    signOutUser,
  } = useCloudAuth();
  const [email, setEmail] = useState("");
  const playGamesAvailable = useMemo(() => isPlayGamesAvailable(), []);

  return (
    <div className="py-3">
      <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
        CLOUD SAVE
      </p>
      <div className="flex items-start gap-1.5 mb-2">
        <AlertTriangle
          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-crown-amber"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          Cloud save does not save games currently in progress.
        </p>
      </div>
      <div className="flex items-start gap-1.5 mb-2">
        <ShieldCheck
          className="w-3.5 h-3.5 shrink-0 mt-0.5 text-spice-lime"
          aria-hidden="true"
        />
        <p className="font-code text-xs text-gray-500 leading-snug">
          Your data is never sold. Emails are only kept in case you need
          support.
        </p>
      </div>
      {isActivityMode ? (
        <ActivityLinkSection accessToken={activityAccessToken} />
      ) : authLoading ? (
        <p className="font-code text-xs text-gray-500">
          Checking sign-in status...
        </p>
      ) : user ? (
        <div className="space-y-2">
          {user.providerId === "playgames.google.com" &&
            showPlayGamesLinkPrompt && (
              <PlayGamesLinkPrompt onDismiss={dismissPlayGamesLinkPrompt} />
            )}
          <p className="font-code text-xs text-gray-300">
            Signed in as{" "}
            <span className="text-spice-lime">
              {user.email ?? user.displayName ?? user.uid}
            </span>
          </p>
          <p className="font-code text-xs text-gray-500">
            {isCloudUpToDate ? (
              <span className="text-spice-lime">Up to date</span>
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
            <p className="font-code text-xs text-spice-red">{actionError}</p>
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
            <GoogleIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            CONTINUE WITH GOOGLE
          </button>
          <button
            type="button"
            onClick={signInWithGithub}
            className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
            style={providerButtonStyle}
          >
            <GithubIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
            CONTINUE WITH GITHUB
          </button>
          {!isActivityMode && (
            <button
              type="button"
              onClick={signInWithDiscord}
              className="w-full flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <DiscordIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              CONTINUE WITH DISCORD
            </button>
          )}
          {playGamesAvailable && (
            <button
              type="button"
              onClick={() => void signInWithPlayGames()}
              className="w-full relative flex items-center justify-center gap-2 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <PlayGamesIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
              CONTINUE WITH PLAY GAMES
              <span className="absolute -top-2 -right-2 font-pixel text-[8px] tracking-widest px-1.5 py-0.5 rounded-full bg-yellow-400 text-black">
                BETA
              </span>
            </button>
          )}
          <div className="flex gap-2 pt-1">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              aria-label="Email address"
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
              className="shrink-0 flex items-center gap-1.5 font-pixel text-xs tracking-widest px-3 py-2"
              style={providerButtonStyle}
            >
              <Mail className="w-3.5 h-3.5 shrink-0" />
              SEND LINK
            </button>
          </div>
          {emailLinkSent && (
            <p className="font-code text-xs text-spice-lime">
              Check your email for a sign-in link.
            </p>
          )}
          {actionError && (
            <p className="font-code text-xs text-spice-red">{actionError}</p>
          )}
        </div>
      )}
    </div>
  );
};

const tabBase =
  "flex-1 py-2 font-pixel text-xs tracking-widest transition-colors";
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
  freeBackgroundsMode = false,
  activityAccessToken = null,
  cloudUpdatedAt = null,
  isCloudUpToDate = true,
  showPlayGamesLinkPrompt = false,
  dismissPlayGamesLinkPrompt = () => {},
  jumpToAccountKey = 0,
  jumpToBackgroundKey = 0,
}: Props) => {
  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [settingsPage, setSettingsPage] = useState<1 | 2 | 3>(1);
  const [errorMessage, setErrorMessage] = useState("");
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [prevJumpToAccountKey, setPrevJumpToAccountKey] =
    useState(jumpToAccountKey);

  if (jumpToAccountKey !== prevJumpToAccountKey) {
    setPrevJumpToAccountKey(jumpToAccountKey);
    if (jumpToAccountKey > 0) {
      setActiveTab("settings");
      setSettingsPage(2);
    }
  }

  const [prevJumpToBackgroundKey, setPrevJumpToBackgroundKey] =
    useState(jumpToBackgroundKey);
  const [isBackgroundDropdownOpen, setIsBackgroundDropdownOpen] =
    useState(false);

  if (jumpToBackgroundKey !== prevJumpToBackgroundKey) {
    setPrevJumpToBackgroundKey(jumpToBackgroundKey);
    if (jumpToBackgroundKey > 0) {
      setActiveTab("settings");
      setSettingsPage(1);
      setIsBackgroundDropdownOpen(true);
    }
  }

  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) setIsBackgroundDropdownOpen(false);
  }

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
    <BaseModal
      title={MODAL_TITLE_SETTINGS}
      isOpen={isOpen}
      handleClose={handleClose}
    >
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
              <span className="font-code text-xs text-spice-red">
                {errorMessage}
              </span>
            </div>
          )}

          {settingsPage === 1 && (
            <div className="flex flex-col divide-y divide-obsidian-700">
              {challengeConfig ? (
                <div className="py-3 space-y-2">
                  <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none mb-2">
                    {challengeConfig.id === "daily"
                      ? "DAILY MODE ACTIVE"
                      : "CUSTOM CHALLENGE ACTIVE"}
                  </p>
                  <div
                    className="p-3 space-y-2"
                    style={{
                      background: "rgba(80,0,170,0.1)",
                      border: "1px solid rgba(80,0,170,0.35)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-crown-amber shrink-0" />
                      <span className="font-code text-xs text-gray-300">
                        {challengeConfig.length} letters
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-crown-amber shrink-0" />
                      <span className="font-code text-xs text-gray-300">
                        {DICT_LABELS[challengeConfig.dict]} dictionary —{" "}
                        <span className="text-gray-500">
                          {DICT_DESCRIPTIONS[challengeConfig.dict]}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-crown-amber shrink-0" />
                      <span className="font-code text-xs text-gray-300">
                        {challengeConfig.guesses} guesses allowed
                      </span>
                    </div>
                  </div>
                  <p className="font-code text-xs text-gray-500 leading-snug">
                    {challengeConfig.id === "daily"
                      ? "Word length and difficulty are set by today's daily word and reset at the next daily."
                      : "Word length and difficulty are set by this challenge. Return to normal Vagudle to change these."}
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
                      <span className="font-pixel text-2xl text-spice-lime w-10 text-center tabular-nums">
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
                          className="absolute inset-y-0 left-0 transition-[width] duration-150"
                          style={{
                            width: `${((wordLength - 4) / 3) * 100}%`,
                            background:
                              "linear-gradient(90deg, #28007c, #5000aa)",
                            borderRadius: 4,
                            zIndex: 2,
                          }}
                        />
                        <div
                          className="absolute top-1/2 transition-[left] duration-150 pointer-events-none w-5.5 h-5.5 rounded-full bg-[linear-gradient(180deg,#5000aa_0%,#28007c_100%)] border-2 border-[#7020cc] shadow-[0_0_8px_rgba(80,0,170,0.6)] z-3"
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
                    settingName={SETTINGS_HARD_MODE_LABEL}
                    flag={settings.hardMode}
                    handleFlag={handleHardModeChange}
                    description={SETTINGS_HARD_MODE_DESCRIPTION}
                  />
                </>
              )}

              <SettingsToggle
                settingName={SETTINGS_SHOW_GRAY_COUNT_LABEL}
                flag={settings.showGrayCount}
                handleFlag={settingsHandlers.setShowGrayCount}
                description={SETTINGS_SHOW_GRAY_COUNT_DESCRIPTION}
              />
              <SettingsToggle
                settingName={SETTINGS_AUTO_GRAY_LABEL}
                flag={settings.autoGray}
                handleFlag={settingsHandlers.setAutoGray}
                description={SETTINGS_AUTO_GRAY_DESCRIPTION}
              />
              <SettingsToggle
                settingName={SETTINGS_AUTO_GREEN_LABEL}
                flag={settings.autoGreen}
                handleFlag={settingsHandlers.setAutoGreen}
                description={SETTINGS_AUTO_GREEN_DESCRIPTION}
              />

              <div className="flex justify-between gap-4 py-3">
                <div className="text-left mt-1">
                  <p className="font-pixel text-xs text-crown-amber tracking-widest leading-none">
                    {SETTINGS_BACKGROUND_LABEL}
                  </p>
                  <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
                    {freeBackgroundsMode
                      ? SETTINGS_BACKGROUND_DESCRIPTION_FREE
                      : SETTINGS_BACKGROUND_DESCRIPTION_LOCKED}
                  </p>
                </div>
                <BackgroundDropdown
                  currentId={settings.backgroundId}
                  unlockedIds={unlockedAchievementIds}
                  isMobile={isMobile}
                  freeBackgroundsMode={freeBackgroundsMode}
                  isOpen={isBackgroundDropdownOpen}
                  onOpenChange={setIsBackgroundDropdownOpen}
                  onChange={settingsHandlers.setBackgroundId}
                />
              </div>
            </div>
          )}

          {settingsPage === 2 && (
            <div className="flex flex-col divide-y divide-obsidian-700">
              <SettingsToggle
                settingName={SETTINGS_EXTRA_EFFECTS_LABEL}
                flag={settings.extraEffects}
                handleFlag={settingsHandlers.setExtraEffects}
                description={SETTINGS_EXTRA_EFFECTS_DESCRIPTION}
              />
              <CloudSaveSection
                cloudUpdatedAt={cloudUpdatedAt}
                isCloudUpToDate={isCloudUpToDate}
                isActivityMode={isActivityMode}
                activityAccessToken={activityAccessToken}
                showPlayGamesLinkPrompt={showPlayGamesLinkPrompt}
                dismissPlayGamesLinkPrompt={dismissPlayGamesLinkPrompt}
              />
            </div>
          )}

          {ENABLE_NOTIFICATION_SETTINGS && settingsPage === 3 && (
            <div className="flex flex-col divide-y divide-obsidian-700">
              <SettingsToggle
                settingName={SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL}
                flag={settings.dailyStreakRemindersEnabled}
                handleFlag={settingsHandlers.setDailyStreakRemindersEnabled}
                description={SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION}
              />

              <div className="flex justify-between gap-4 py-3">
                <div className="text-left mt-1">
                  <div className="flex items-center gap-1.5">
                    <p
                      className="font-pixel text-xs tracking-widest leading-none"
                      style={{
                        color: settings.customReminderTimeEnabled
                          ? "#d4af37"
                          : "#6b7280",
                      }}
                    >
                      {SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL.toUpperCase()}
                    </p>
                  </div>
                  <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
                    {SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION}
                  </p>
                  <div className="mt-2.5">
                    <NotificationTimePicker
                      hour={settings.customReminderHour}
                      minute={settings.customReminderMinute}
                      period={settings.customReminderPeriod}
                      disabled={!settings.customReminderTimeEnabled}
                      onHourChange={settingsHandlers.setCustomReminderHour}
                      onMinuteChange={settingsHandlers.setCustomReminderMinute}
                      onPeriodChange={settingsHandlers.setCustomReminderPeriod}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    settingsHandlers.setCustomReminderTimeEnabled(
                      !settings.customReminderTimeEnabled
                    )
                  }
                  aria-label={SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL}
                  className="shrink-0 w-14 h-8 transition-colors duration-300 ease-in-out pixel-border-sm"
                  style={{
                    background: settings.customReminderTimeEnabled
                      ? "linear-gradient(180deg, #5000aa 0%, #28007c 100%)"
                      : "rgba(255,255,255,0.05)",
                    border: `2px solid ${
                      settings.customReminderTimeEnabled ? "#5000aa" : "#3a3a4a"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: settings.customReminderTimeEnabled
                      ? "flex-end"
                      : "flex-start",
                    padding: "0 4px",
                    cursor: "pointer",
                  }}
                  aria-pressed={settings.customReminderTimeEnabled}
                >
                  <span
                    className="w-5 h-5 shrink-0 transition-colors duration-300"
                    style={{
                      background: settings.customReminderTimeEnabled
                        ? "#d4af37"
                        : "#555570",
                    }}
                  />
                </button>
              </div>

              <div className="flex justify-between gap-4 py-3">
                <div className="text-left mt-1">
                  <p
                    className="font-pixel text-xs tracking-widest leading-none"
                    style={{
                      color: settings.inactivityReminderEnabled
                        ? "#d4af37"
                        : "#6b7280",
                    }}
                  >
                    {SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL.toUpperCase()}
                  </p>
                  <p className="font-code text-xs mt-1.5 text-gray-500 leading-snug">
                    {SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION}
                  </p>
                  <div className="mt-2.5">
                    <InactivityDaysInput
                      value={settings.inactivityReminderDays}
                      disabled={!settings.inactivityReminderEnabled}
                      onChange={settingsHandlers.setInactivityReminderDays}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    settingsHandlers.setInactivityReminderEnabled(
                      !settings.inactivityReminderEnabled
                    )
                  }
                  aria-label={SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL}
                  className="shrink-0 w-14 h-8 transition-colors duration-300 ease-in-out pixel-border-sm"
                  style={{
                    background: settings.inactivityReminderEnabled
                      ? "linear-gradient(180deg, #5000aa 0%, #28007c 100%)"
                      : "rgba(255,255,255,0.05)",
                    border: `2px solid ${
                      settings.inactivityReminderEnabled ? "#5000aa" : "#3a3a4a"
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: settings.inactivityReminderEnabled
                      ? "flex-end"
                      : "flex-start",
                    padding: "0 4px",
                    cursor: "pointer",
                  }}
                  aria-pressed={settings.inactivityReminderEnabled}
                >
                  <span
                    className="w-5 h-5 shrink-0 transition-colors duration-300"
                    style={{
                      background: settings.inactivityReminderEnabled
                        ? "#d4af37"
                        : "#555570",
                    }}
                  />
                </button>
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 pt-4">
            {(ENABLE_NOTIFICATION_SETTINGS
              ? ([1, 2, 3] as const)
              : ([1, 2] as const)
            ).map((page) => (
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
