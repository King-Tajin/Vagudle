import { REVEAL_TIME_MS } from "../constants/settings";

const getHapticsPlugin = (): CapacitorHapticsPlugin | null => {
  if (typeof window === "undefined") return null;
  if (!window.Capacitor?.isNativePlatform?.()) return null;
  return window.Capacitor.Plugins?.Haptics ?? null;
};

const triggerNotification = (
  enabled: boolean,
  type: CapacitorNotificationType
): void => {
  if (!enabled) return;
  const plugin = getHapticsPlugin();
  if (!plugin) return;
  void plugin.notification({ type }).catch(() => {});
};

const triggerImpact = (enabled: boolean, style: CapacitorImpactStyle): void => {
  if (!enabled) return;
  const plugin = getHapticsPlugin();
  if (!plugin) return;
  void plugin.impact({ style }).catch(() => {});
};

export const triggerErrorHaptic = (enabled: boolean): void =>
  triggerNotification(enabled, "ERROR");

export const triggerSuccessHaptic = (enabled: boolean): void =>
  triggerNotification(enabled, "SUCCESS");

export const triggerLossHaptic = (enabled: boolean): void =>
  triggerNotification(enabled, "WARNING");

export const triggerAchievementHaptic = (enabled: boolean): void =>
  triggerImpact(enabled, "HEAVY");

export const triggerKeyHaptic = (enabled: boolean): void =>
  triggerImpact(enabled, "LIGHT");

export const triggerRevealHaptics = (
  enabled: boolean,
  tileCount: number
): void => {
  if (!enabled || !getHapticsPlugin()) return;
  for (let i = 0; i < tileCount; i++) {
    setTimeout(
      () => triggerImpact(enabled, "LIGHT"),
      i * REVEAL_TIME_MS + REVEAL_TIME_MS / 2
    );
  }
};
