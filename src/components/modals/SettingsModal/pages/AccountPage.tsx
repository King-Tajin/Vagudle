import { SettingsToggle } from "../../SettingsToggle";
import { CloudSaveSection } from "../CloudSaveSection";
import type { GameSettingsValues, GameSettingsHandlers } from "../index";
import type { SyncStatus } from "../../../../hooks/useCloudSync";
import strings from "../../../../constants/strings";

export const AccountPage = ({
  settings,
  settingsHandlers,
  cloudUpdatedAt,
  cloudSyncState,
  retryCloudSync,
  isActivityMode,
  activityAccessToken,
  showPlayGamesLinkPrompt,
  dismissPlayGamesLinkPrompt,
}: {
  settings: GameSettingsValues;
  settingsHandlers: GameSettingsHandlers;
  cloudUpdatedAt: string | null;
  cloudSyncState: SyncStatus;
  retryCloudSync: () => void;
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
        cloudSyncState={cloudSyncState}
        retryCloudSync={retryCloudSync}
        isActivityMode={isActivityMode}
        activityAccessToken={activityAccessToken}
        showPlayGamesLinkPrompt={showPlayGamesLinkPrompt}
        dismissPlayGamesLinkPrompt={dismissPlayGamesLinkPrompt}
      />
    </div>
  );
};
