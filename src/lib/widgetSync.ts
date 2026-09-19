const getWidgetSyncPlugin = (): CapacitorWidgetSyncPlugin | null => {
  if (typeof window === "undefined") return null;
  if (!window.Capacitor?.isNativePlatform?.()) return null;
  return window.Capacitor.Plugins?.WidgetSync ?? null;
};

export const syncWidget = async <K extends keyof WidgetSyncPayloadMap>(
  widget: K,
  payload: WidgetSyncPayloadMap[K]
): Promise<void> => {
  const plugin = getWidgetSyncPlugin();
  if (!plugin) return;
  try {
    await plugin.syncWidgetData({ widget, payload });
  } catch {}
};
