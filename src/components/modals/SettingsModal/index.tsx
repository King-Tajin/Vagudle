import React, { useState, useEffect, useRef } from "react";
import { BaseModal } from "../BaseModal";
import { ChallengeCreatorModal } from "../ChallengeCreatorModal";
import { GeneralSettingsPage } from "./pages/GeneralSettingsPage";
import { AccountPage } from "./pages/AccountPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { tabBase, activeTabStyle, inactiveTabStyle } from "./styles";
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

  const handleLanguageChange = (value: Language) => {
    settingsHandlers.setLanguage(value);
    saveSettingsToLocalStorage({ wordLength, ...settings, language: value });
    window.location.reload();
  };

  return (
    <BaseModal
      title={strings.MODAL_TITLE_SETTINGS}
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

          <div className="flex justify-center gap-2 pt-4">
            {(ENABLE_NOTIFICATION_SETTINGS || ENABLE_HAPTICS_SETTINGS
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
