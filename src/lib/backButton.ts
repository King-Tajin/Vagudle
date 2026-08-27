import { useEffect, useRef } from "react";

export type CapacitorBackButtonEvent = {
  canGoBack: boolean;
};

export type CapacitorAppPlugin = {
  addListener: (
    eventName: "backButton",
    listenerFunc: (event: CapacitorBackButtonEvent) => void
  ) => Promise<{ remove: () => void }>;
  exitApp: () => void;
};

type StackEntry = {
  id: number;
  onBack: () => void;
};

const stack: StackEntry[] = [];
let nextId = 1;
let listenerRegistered = false;

const getAppPlugin = (): CapacitorAppPlugin | null => {
  if (typeof window === "undefined") return null;
  if (!window.Capacitor?.isNativePlatform?.()) return null;
  return window.Capacitor.Plugins?.App ?? null;
};

const handleBackButton = (event: CapacitorBackButtonEvent): void => {
  const top = stack[stack.length - 1];
  if (top) {
    top.onBack();
    return;
  }
  if (event.canGoBack) {
    window.history.back();
    return;
  }
  getAppPlugin()?.exitApp();
};

const ensureListenerRegistered = (): void => {
  if (listenerRegistered) return;
  const plugin = getAppPlugin();
  if (!plugin) return;
  listenerRegistered = true;
  void plugin.addListener("backButton", handleBackButton);
};

export const useBackButtonClose = (
  isOpen: boolean,
  onBack: () => void
): void => {
  const onBackRef = useRef(onBack);

  useEffect(() => {
    onBackRef.current = onBack;
  }, [onBack]);

  useEffect(() => {
    if (!isOpen) return undefined;

    ensureListenerRegistered();

    const entry: StackEntry = {
      id: nextId++,
      onBack: () => onBackRef.current(),
    };
    stack.push(entry);

    return () => {
      const index = stack.findIndex((item) => item.id === entry.id);
      if (index !== -1) stack.splice(index, 1);
    };
  }, [isOpen]);
};
