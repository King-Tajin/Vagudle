import { SettingsToggle } from "../../SettingsToggle";
import { CloudSaveSection } from "../CloudSaveSection";
import type { GameSettingsValues, GameSettingsHandlers } from "../index";
import strings from "../../../../constants/strings";

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
        settingName={strings.SETTINGS_EXTRA_EFFECTS_LABEL}
        flag={settings.extraEffects}
        handleFlag={settingsHandlers.setExtraEffects}
        description={strings.SETTINGS_EXTRA_EFFECTS_DESCRIPTION}
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
