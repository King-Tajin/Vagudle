import type { DailyStats } from "./daily";
import { DAILY_RELEASE_HOUR_UTC } from "./daily";

export type ReminderPeriod = "AM" | "PM";

export type NotificationSettings = {
  dailyStreakRemindersEnabled: boolean;
  streakResetWarningHours: number;
  customReminderTimeEnabled: boolean;
  customReminderHour: number;
  customReminderMinute: number;
  customReminderPeriod: ReminderPeriod;
  inactivityReminderEnabled: boolean;
  inactivityReminderDays: number;
};

export const STREAK_RESET_WARNING_NOTIFICATION_ID = 19821;
export const CUSTOM_TIME_REMINDER_NOTIFICATION_ID = 19823;
export const INACTIVITY_REMINDER_NOTIFICATION_ID = 19822;
export const REMINDER_NOTIFICATION_CHANNEL_ID = "vagudle-reminders";
export const REMINDER_NOTIFICATION_LARGE_ICON = "ic_notification_large";

export const DEFAULT_DAILY_REMINDER_HOUR = 20;
export const DEFAULT_DAILY_REMINDER_MINUTE = 0;

type CapacitorLocalNotificationsSchedule = {
  at?: Date;
  repeats?: boolean;
  allowWhileIdle?: boolean;
  on?: {
    hour?: number;
    minute?: number;
  };
};

type CapacitorLocalNotification = {
  id: number;
  title: string;
  body: string;
  channelId?: string;
  largeIcon?: string;
  schedule?: CapacitorLocalNotificationsSchedule;
};

type CapacitorPermissionStatus = {
  display: "granted" | "denied" | "prompt" | "prompt-with-rationale";
};

export type CapacitorLocalNotificationsPlugin = {
  schedule: (options: {
    notifications: CapacitorLocalNotification[];
  }) => Promise<unknown>;
  cancel: (options: { notifications: { id: number }[] }) => Promise<void>;
  createChannel: (channel: {
    id: string;
    name: string;
    description?: string;
    importance?: number;
  }) => Promise<void>;
  checkPermissions: () => Promise<CapacitorPermissionStatus>;
  requestPermissions: () => Promise<CapacitorPermissionStatus>;
};

export type CapacitorNotificationPrimerResult = {
  alreadyShown: boolean;
  accepted: boolean;
};

export type CapacitorNotificationPrimerPlugin = {
  showPrimer: () => Promise<CapacitorNotificationPrimerResult>;
};

const getNotificationPrimerPlugin =
  (): CapacitorNotificationPrimerPlugin | null => {
    if (typeof window === "undefined") return null;
    if (!window.Capacitor?.isNativePlatform?.()) return null;
    return window.Capacitor.Plugins?.NotificationPrimer ?? null;
  };

const getLocalNotificationsPlugin =
  (): CapacitorLocalNotificationsPlugin | null => {
    if (typeof window === "undefined") return null;
    if (!window.Capacitor?.isNativePlatform?.()) return null;
    return window.Capacitor.Plugins?.LocalNotifications ?? null;
  };

export const to24Hour = (hour12: number, period: ReminderPeriod): number => {
  const normalizedHour = hour12 % 12;
  return period === "PM" ? normalizedHour + 12 : normalizedHour;
};

export const getCustomReminderTime = (
  settings: Pick<
    NotificationSettings,
    "customReminderHour" | "customReminderMinute" | "customReminderPeriod"
  >
): { hour: number; minute: number } => ({
  hour: to24Hour(settings.customReminderHour, settings.customReminderPeriod),
  minute: settings.customReminderMinute,
});

export const getStreakResetWarningFireDate = (
  currentDailyDate: string | null,
  lastCompletedDate: DailyStats["lastCompletedDate"],
  streakResetWarningHours: number,
  now: Date = new Date()
): Date | null => {
  if (!currentDailyDate) return null;
  if (lastCompletedDate === currentDailyDate) return null;

  const [year, month, day] = currentDailyDate.split("-").map(Number);
  if (!year || !month || !day) return null;

  const releaseTime = Date.UTC(year, month - 1, day, DAILY_RELEASE_HOUR_UTC);
  const resetTime = releaseTime + 24 * 60 * 60 * 1000;
  const fireDate = new Date(
    resetTime - streakResetWarningHours * 60 * 60 * 1000
  );

  return fireDate.getTime() > now.getTime() ? fireDate : null;
};

export const getInactivityReminderFireDate = (
  lastCompletedDate: DailyStats["lastCompletedDate"],
  inactivityReminderDays: number,
  now: Date = new Date()
): Date | null => {
  if (!lastCompletedDate) return null;
  const lastPlayed = new Date(`${lastCompletedDate}T00:00:00Z`);
  if (Number.isNaN(lastPlayed.getTime())) return null;

  const fireDate = new Date(lastPlayed);
  fireDate.setUTCDate(fireDate.getUTCDate() + inactivityReminderDays);
  fireDate.setUTCHours(DEFAULT_DAILY_REMINDER_HOUR, 0, 0, 0);

  return fireDate.getTime() > now.getTime() ? fireDate : null;
};

const ensureChannel = async (
  plugin: CapacitorLocalNotificationsPlugin
): Promise<void> => {
  try {
    await plugin.createChannel({
      id: REMINDER_NOTIFICATION_CHANNEL_ID,
      name: "Play Reminders",
      description: "Reminders to keep your streak alive and come back to play",
      importance: 3,
    });
  } catch {}
};

const ensurePermission = async (
  plugin: CapacitorLocalNotificationsPlugin
): Promise<boolean> => {
  try {
    const current = await plugin.checkPermissions();
    if (current.display === "granted") return true;
    const requested = await plugin.requestPermissions();
    return requested.display === "granted";
  } catch {
    return false;
  }
};

export const syncNotificationSchedule = async (
  settings: NotificationSettings,
  lastCompletedDate: DailyStats["lastCompletedDate"],
  currentDailyDate: string | null
): Promise<void> => {
  const plugin = getLocalNotificationsPlugin();
  if (!plugin) return;

  const anyReminderEnabled =
    settings.dailyStreakRemindersEnabled ||
    settings.customReminderTimeEnabled ||
    settings.inactivityReminderEnabled;

  if (!anyReminderEnabled) {
    await plugin.cancel({
      notifications: [
        { id: STREAK_RESET_WARNING_NOTIFICATION_ID },
        { id: CUSTOM_TIME_REMINDER_NOTIFICATION_ID },
        { id: INACTIVITY_REMINDER_NOTIFICATION_ID },
      ],
    });
    return;
  }

  const granted = await ensurePermission(plugin);
  if (!granted) return;

  await ensureChannel(plugin);

  try {
    await plugin.cancel({
      notifications: [
        { id: STREAK_RESET_WARNING_NOTIFICATION_ID },
        { id: CUSTOM_TIME_REMINDER_NOTIFICATION_ID },
        { id: INACTIVITY_REMINDER_NOTIFICATION_ID },
      ],
    });
  } catch {}

  const notificationsToSchedule: CapacitorLocalNotification[] = [];

  if (settings.dailyStreakRemindersEnabled) {
    const fireDate = getStreakResetWarningFireDate(
      currentDailyDate,
      lastCompletedDate,
      settings.streakResetWarningHours
    );
    if (fireDate) {
      notificationsToSchedule.push({
        id: STREAK_RESET_WARNING_NOTIFICATION_ID,
        title: "Your streak is about to reset!",
        body: "Play today's Vagudle before it's too late.",
        channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
        largeIcon: REMINDER_NOTIFICATION_LARGE_ICON,
        schedule: {
          at: fireDate,
          allowWhileIdle: true,
        },
      });
    }
  }

  if (settings.customReminderTimeEnabled) {
    const { hour, minute } = getCustomReminderTime(settings);
    notificationsToSchedule.push({
      id: CUSTOM_TIME_REMINDER_NOTIFICATION_ID,
      title: "Don't lose your streak!",
      body: "Today's Vagudle is waiting for you.",
      channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
      largeIcon: REMINDER_NOTIFICATION_LARGE_ICON,
      schedule: {
        on: { hour, minute },
        allowWhileIdle: true,
      },
    });
  }

  if (settings.inactivityReminderEnabled) {
    const fireDate = getInactivityReminderFireDate(
      lastCompletedDate,
      settings.inactivityReminderDays
    );
    if (fireDate) {
      notificationsToSchedule.push({
        id: INACTIVITY_REMINDER_NOTIFICATION_ID,
        title: "Haven't played in a while?",
        body: "Come back and pick up where you left off.",
        channelId: REMINDER_NOTIFICATION_CHANNEL_ID,
        largeIcon: REMINDER_NOTIFICATION_LARGE_ICON,
        schedule: {
          at: fireDate,
          allowWhileIdle: true,
        },
      });
    }
  }

  if (notificationsToSchedule.length > 0) {
    await plugin.schedule({ notifications: notificationsToSchedule });
  }
};

export const runNotificationPrimerFlow = async (
  settings: NotificationSettings,
  lastCompletedDate: DailyStats["lastCompletedDate"],
  currentDailyDate: string | null
): Promise<void> => {
  const primerPlugin = getNotificationPrimerPlugin();
  if (!primerPlugin) {
    await syncNotificationSchedule(
      settings,
      lastCompletedDate,
      currentDailyDate
    );
    return;
  }

  const result = await primerPlugin.showPrimer();
  if (result.alreadyShown || !result.accepted) return;

  await syncNotificationSchedule(settings, lastCompletedDate, currentDailyDate);
};
