import { SettingsToggle } from "../SettingsToggle";
import { CloudSaveSection } from "./CloudSaveSection";
import {
  SETTINGS_EXTRA_EFFECTS_LABEL,
  SETTINGS_EXTRA_EFFECTS_DESCRIPTION,
} from "../../../constants/strings";
import type {
  GameSettingsValues,
  GameSettingsHandlers,
} from "../SettingsModal";

export const AccountPage = ({
  settings,
  settingsHandlers,
  cloudUpdatedAt,
  isCloudUpToDate,
  isActivityMode,
  activityAccessToken,
  showPlayGamesLinkPrompt,
  dismissPlayGamesLinkPrompt,
}: {
  settings: GameSettingsValues;
  settingsHandlers: GameSettingsHandlers;
  cloudUpdatedAt: string | null;
  isCloudUpToDate: boolean;
  isActivityMode: boolean;
  activityAccessToken: string | null;
  showPlayGamesLinkPrompt: boolean;
  dismissPlayGamesLinkPrompt: () => void;
}) => {
  return (
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
  );
};
