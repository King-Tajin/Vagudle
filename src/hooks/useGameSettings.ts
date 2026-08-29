import { useMemo, useState } from "react";
import { type BackgroundId, loadBackgroundId } from "../lib/backgrounds";
import { isDiscordActivity } from "../lib/discord";
import type { StoredSettings } from "../lib/localStorage";

export type GameSettingsValues = {
  showGrayCount: boolean;
  hardMode: boolean;
  autoGray: boolean;
  autoGreen: boolean;
  extraEffects: boolean;
  backgroundId: BackgroundId;
  dailyStreakRemindersEnabled: boolean;
  streakResetWarningHours: number;
  customReminderTimeEnabled: boolean;
  customReminderHour: number;
  customReminderMinute: number;
  customReminderPeriod: "AM" | "PM";
  inactivityReminderEnabled: boolean;
  inactivityReminderDays: number;
  hapticsEnabled: boolean;
};

export type GameSettingsHandlers = {
  setShowGrayCount: (value: boolean) => void;
  setHardMode: (value: boolean) => void;
  setAutoGray: (value: boolean) => void;
  setAutoGreen: (value: boolean) => void;
  setExtraEffects: (value: boolean) => void;
  setBackgroundId: (value: BackgroundId) => void;
  setDailyStreakRemindersEnabled: (value: boolean) => void;
  setStreakResetWarningHours: (value: number) => void;
  setCustomReminderTimeEnabled: (value: boolean) => void;
  setCustomReminderHour: (value: number) => void;
  setCustomReminderMinute: (value: number) => void;
  setCustomReminderPeriod: (value: "AM" | "PM") => void;
  setInactivityReminderEnabled: (value: boolean) => void;
  setInactivityReminderDays: (value: number) => void;
  setHapticsEnabled: (value: boolean) => void;
};

export const useGameSettings = (
  savedSettings: StoredSettings
): { settings: GameSettingsValues; settingsHandlers: GameSettingsHandlers } => {
  const [showGrayCount, setShowGrayCount] = useState(
    savedSettings.showGrayCount
  );
  const [hardMode, setHardMode] = useState(savedSettings.hardMode);
  const [autoGray, setAutoGray] = useState(savedSettings.autoGray);
  const [autoGreen, setAutoGreen] = useState(savedSettings.autoGreen);
  const [extraEffects, setExtraEffects] = useState(savedSettings.extraEffects);
  const [backgroundId, setBackgroundId] = useState<BackgroundId>(() =>
    loadBackgroundId(window.innerWidth < 640, isDiscordActivity)
  );
  const [dailyStreakRemindersEnabled, setDailyStreakRemindersEnabled] =
    useState(savedSettings.dailyStreakRemindersEnabled);
  const [streakResetWarningHours, setStreakResetWarningHours] = useState(
    savedSettings.streakResetWarningHours
  );
  const [customReminderTimeEnabled, setCustomReminderTimeEnabled] = useState(
    savedSettings.customReminderTimeEnabled
  );
  const [customReminderHour, setCustomReminderHour] = useState(
    savedSettings.customReminderHour
  );
  const [customReminderMinute, setCustomReminderMinute] = useState(
    savedSettings.customReminderMinute
  );
  const [customReminderPeriod, setCustomReminderPeriod] = useState(
    savedSettings.customReminderPeriod
  );
  const [inactivityReminderEnabled, setInactivityReminderEnabled] = useState(
    savedSettings.inactivityReminderEnabled
  );
  const [inactivityReminderDays, setInactivityReminderDays] = useState(
    savedSettings.inactivityReminderDays
  );
  const [hapticsEnabled, setHapticsEnabled] = useState(
    savedSettings.hapticsEnabled
  );

  const settings = useMemo<GameSettingsValues>(
    () => ({
      showGrayCount,
      hardMode,
      autoGray,
      autoGreen,
      extraEffects,
      backgroundId,
      dailyStreakRemindersEnabled,
      streakResetWarningHours,
      customReminderTimeEnabled,
      customReminderHour,
      customReminderMinute,
      customReminderPeriod,
      inactivityReminderEnabled,
      inactivityReminderDays,
      hapticsEnabled,
    }),
    [
      showGrayCount,
      hardMode,
      autoGray,
      autoGreen,
      extraEffects,
      backgroundId,
      dailyStreakRemindersEnabled,
      streakResetWarningHours,
      customReminderTimeEnabled,
      customReminderHour,
      customReminderMinute,
      customReminderPeriod,
      inactivityReminderEnabled,
      inactivityReminderDays,
      hapticsEnabled,
    ]
  );

  const settingsHandlers = useMemo<GameSettingsHandlers>(
    () => ({
      setShowGrayCount,
      setHardMode,
      setAutoGray,
      setAutoGreen,
      setExtraEffects,
      setBackgroundId,
      setDailyStreakRemindersEnabled,
      setStreakResetWarningHours,
      setCustomReminderTimeEnabled,
      setCustomReminderHour,
      setCustomReminderMinute,
      setCustomReminderPeriod,
      setInactivityReminderEnabled,
      setInactivityReminderDays,
      setHapticsEnabled,
    }),
    []
  );

  return { settings, settingsHandlers };
};
