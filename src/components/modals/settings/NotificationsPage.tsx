import { SettingsToggle } from "../SettingsToggle";
import { NotificationTimePicker } from "./NotificationTimePicker";
import { InactivityDaysInput } from "./InactivityDaysInput";
import {
  SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL,
  SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION,
  SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL,
  SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION,
  SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL,
  SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION,
} from "../../../constants/strings";
import type {
  GameSettingsValues,
  GameSettingsHandlers,
} from "../SettingsModal";

export const NotificationsPage = ({
  settings,
  settingsHandlers,
}: {
  settings: GameSettingsValues;
  settingsHandlers: GameSettingsHandlers;
}) => {
  return (
    <div className="flex flex-col divide-y divide-obsidian-700">
      <SettingsToggle
        settingName={SETTINGS_NOTIFICATIONS_DAILY_STREAK_LABEL}
        flag={settings.dailyStreakRemindersEnabled}
        handleFlag={settingsHandlers.setDailyStreakRemindersEnabled}
        description={SETTINGS_NOTIFICATIONS_DAILY_STREAK_DESCRIPTION}
      />

      <SettingsToggle
        settingName={SETTINGS_NOTIFICATIONS_CUSTOM_TIME_LABEL}
        flag={settings.customReminderTimeEnabled}
        handleFlag={settingsHandlers.setCustomReminderTimeEnabled}
        description={SETTINGS_NOTIFICATIONS_CUSTOM_TIME_DESCRIPTION}
        dimLabelWhenOff
      >
        <NotificationTimePicker
          hour={settings.customReminderHour}
          minute={settings.customReminderMinute}
          period={settings.customReminderPeriod}
          disabled={!settings.customReminderTimeEnabled}
          onHourChange={settingsHandlers.setCustomReminderHour}
          onMinuteChange={settingsHandlers.setCustomReminderMinute}
          onPeriodChange={settingsHandlers.setCustomReminderPeriod}
        />
      </SettingsToggle>

      <SettingsToggle
        settingName={SETTINGS_NOTIFICATIONS_INACTIVITY_LABEL}
        flag={settings.inactivityReminderEnabled}
        handleFlag={settingsHandlers.setInactivityReminderEnabled}
        description={SETTINGS_NOTIFICATIONS_INACTIVITY_DESCRIPTION}
        dimLabelWhenOff
      >
        <InactivityDaysInput
          value={settings.inactivityReminderDays}
          disabled={!settings.inactivityReminderEnabled}
          onChange={settingsHandlers.setInactivityReminderDays}
        />
      </SettingsToggle>
    </div>
  );
};
