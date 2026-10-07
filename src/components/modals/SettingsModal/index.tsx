import React, { useState, useEffect, useRef } from "react";
import { BaseModal } from "../BaseModal";
import { ChallengeCreatorModal } from "../ChallengeCreatorModal";
import { GeneralSettingsPage } from "./pages/GeneralSettingsPage";
import { AccountPage } from "./pages/AccountPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import {
  activeTabStyle,
  inactiveTabStyle,
  mainTabBarClass,
  mainTabBarStyle,
  mainTabBase,
  mainTabLabelClass,
  activeMainTabStyle,
  inactiveMainTabStyle,
  activeMainTabLabelStyle,
  inactiveMainTabLabelStyle,
} from "./styles";
import { type ChallengeConfig } from "../../../lib/challenge";
import type { DuelConfig } from "../../../lib/duel";
import {
  ENABLE_NOTIFICATION_SETTINGS,
  ENABLE_HAPTICS_SETTINGS,
} from "../../../constants/settings";
import type {
  GameSettingsValues,
  GameSettingsHandlers,
} from "../../../hooks/useGameSettings";
import { saveSettingsToLocalStorage } from "../../../lib/localStorage";
import type { Language } from "../../../constants/languages";
import strings from "../../../constants/strings";
import { useCloudAuth } from "../../../hooks/useCloudAuth";
import {
  getIdTokenForCurrentUser,
  buildCloudSavePayloadFromLocalStorage,
  pushCloudSave,
} from "../../../lib/cloudSync";

const LANGUAGE_CLOUD_SAVE_TIMEOUT_MS = 2500;

export type { GameSettingsValues, GameSettingsHandlers };

type Tab = "settings" | "challenge";

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
  activityContext?: {
    isActivityMode: boolean;
    freeBackgroundsMode: boolean;
    activityAccessToken: string | null;
  };
  cloudSyncStatus?: {
    updatedAt: string | null;
    isUpToDate: boolean;
    showPlayGamesLinkPrompt: boolean;
    dismissPlayGamesLinkPrompt: () => void;
  };
  jumpKeys?: {
    account: number;
    background: number;
  };
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
  activityContext,
  cloudSyncStatus,
  jumpKeys,
}: Props) => {
  const {
    isActivityMode = false,
    freeBackgroundsMode = false,
    activityAccessToken = null,
  } = activityContext ?? {};

  const {
    updatedAt: cloudUpdatedAt = null,
    isUpToDate: isCloudUpToDate = true,
    showPlayGamesLinkPrompt = false,
    dismissPlayGamesLinkPrompt = () => {},
  } = cloudSyncStatus ?? {};

  const { account: jumpToAccountKey = 0, background: jumpToBackgroundKey = 0 } =
    jumpKeys ?? {};

  const { user } = useCloudAuth();

  const [activeTab, setActiveTab] = useState<Tab>("settings");
  const [settingsPage, setSettingsPage] = useState<1 | 2 | 3>(1);
  const [aiGuideOpen, setAiGuideOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSavingLanguage, setIsSavingLanguage] = useState(false);
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

  const settingsPages: { page: 1 | 2 | 3; label: string }[] = [
    { page: 1, label: strings.SETTINGS_PAGE_GAMEPLAY_LABEL },
    { page: 2, label: strings.SETTINGS_PAGE_ACCOUNT_LABEL },
    ...(ENABLE_NOTIFICATION_SETTINGS || ENABLE_HAPTICS_SETTINGS
      ? [{ page: 3 as const, label: strings.SETTINGS_PAGE_NOTIFICATIONS_LABEL }]
      : []),
  ];

  const showError = (msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setErrorMessage(msg);
    errorTimerRef.current = setTimeout(() => setErrorMessage(""), 3000);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (hasStarted) {
      showError(strings.SETTINGS_WORD_LENGTH_CHANGE_BLOCKED_ERROR_TEXT);
      return;
    }
    onWordLengthChange(Number(e.target.value));
  };

  const handleHardModeChange = (value: boolean) => {
    if (hasStarted) {
      showError(strings.SETTINGS_DIFFICULTY_CHANGE_BLOCKED_ERROR_TEXT);
      return;
    }
    settingsHandlers.setHardMode(value);
  };

  const handleLanguageChange = async (value: Language) => {
    settingsHandlers.setLanguage(value);
    saveSettingsToLocalStorage({ wordLength, ...settings, language: value });

    if (user) {
      setIsSavingLanguage(true);
      const pushLanguageToCloud = async () => {
        const idToken = await getIdTokenForCurrentUser();
        if (!idToken) return;
        await pushCloudSave(
          idToken,
          buildCloudSavePayloadFromLocalStorage(isMobile)
        );
      };
      await Promise.race([
        pushLanguageToCloud().catch(() => {}),
        new Promise((resolve) =>
          setTimeout(resolve, LANGUAGE_CLOUD_SAVE_TIMEOUT_MS)
        ),
      ]);
    }

    window.location.reload();
  };

  return (
    <BaseModal
      title={strings.MODAL_TITLE_SETTINGS}
      isOpen={isOpen}
      handleClose={handleClose}
      maxWidthClass={aiGuideOpen ? "sm:max-w-2xl" : undefined}
    >
      <div className={mainTabBarClass} style={mainTabBarStyle} role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "settings"}
          className={mainTabBase}
          style={
            activeTab === "settings" ? activeMainTabStyle : inactiveMainTabStyle
          }
          onClick={() => setActiveTab("settings")}
        >
          <span
            className={mainTabLabelClass}
            style={
              activeTab === "settings"
                ? activeMainTabLabelStyle
                : inactiveMainTabLabelStyle
            }
          >
            {strings.SETTINGS_MODAL_TAB_SETTINGS_LABEL}
          </span>
        </button>
        {!isActivityMode && (
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "challenge"}
            className={mainTabBase}
            style={
              activeTab === "challenge"
                ? activeMainTabStyle
                : inactiveMainTabStyle
            }
            onClick={() => setActiveTab("challenge")}
          >
            <span
              className={mainTabLabelClass}
              style={
                activeTab === "challenge"
                  ? activeMainTabLabelStyle
                  : inactiveMainTabLabelStyle
              }
            >
              {strings.SETTINGS_MODAL_TAB_CHALLENGE_LABEL}
            </span>
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
            <GeneralSettingsPage
              wordLength={wordLength}
              onWordLengthChange={handleSliderChange}
              settings={settings}
              settingsHandlers={settingsHandlers}
              challengeConfig={challengeConfig}
              unlockedAchievementIds={unlockedAchievementIds}
              isMobile={isMobile}
              freeBackgroundsMode={freeBackgroundsMode}
              isBackgroundDropdownOpen={isBackgroundDropdownOpen}
              setIsBackgroundDropdownOpen={setIsBackgroundDropdownOpen}
              handleHardModeChange={handleHardModeChange}
              handleLanguageChange={handleLanguageChange}
              isSavingLanguage={isSavingLanguage}
            />
          )}

          {settingsPage === 2 && (
            <AccountPage
              settings={settings}
              settingsHandlers={settingsHandlers}
              cloudUpdatedAt={cloudUpdatedAt}
              isCloudUpToDate={isCloudUpToDate}
              isActivityMode={isActivityMode}
              activityAccessToken={activityAccessToken}
              showPlayGamesLinkPrompt={showPlayGamesLinkPrompt}
              dismissPlayGamesLinkPrompt={dismissPlayGamesLinkPrompt}
            />
          )}

          {(ENABLE_NOTIFICATION_SETTINGS || ENABLE_HAPTICS_SETTINGS) &&
            settingsPage === 3 && (
              <NotificationsPage
                settings={settings}
                settingsHandlers={settingsHandlers}
              />
            )}

          <div className="flex gap-2 pt-4">
            {settingsPages.map(({ page, label }) => (
              <button
                key={page}
                type="button"
                onClick={() => setSettingsPage(page)}
                aria-pressed={settingsPage === page}
                className="flex-1 min-w-0 py-2 px-1 font-pixel text-[10px] tracking-wider transition-colors"
                style={
                  settingsPage === page ? activeTabStyle : inactiveTabStyle
                }
              >
                {label}
              </button>
            ))}
          </div>
        </>
      )}
      {activeTab === "challenge" && (
        <ChallengeCreatorModal onAiGuideChange={setAiGuideOpen} />
      )}
    </BaseModal>
  );
};
