import { useEffect, useState } from "react";
import { ENABLE_OFFLINE_MODE } from "../constants/settings";
import { checkBackendReachable } from "../lib/offlineMode";

const NETWORK_CHANGE_CHECK_DELAY_MS = 25000;

const getNetworkPlugin = (): CapacitorNetworkPlugin | null => {
  if (typeof window === "undefined") return null;
  if (!window.Capacitor?.isNativePlatform?.()) return null;
  return window.Capacitor.Plugins?.Network ?? null;
};

export const useOfflineModeCheck = () => {
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  useEffect(() => {
    if (!ENABLE_OFFLINE_MODE) return;

    let cancelled = false;
    let debounceTimeoutId: ReturnType<typeof setTimeout> | undefined;
    let checkController = new AbortController();

    void checkBackendReachable(checkController.signal).then((reachable) => {
      if (!cancelled && !reachable) {
        setIsOfflineModalOpen(true);
      }
    });

    const runNetworkChangeCheck = () => {
      clearTimeout(debounceTimeoutId);
      checkController.abort();

      debounceTimeoutId = setTimeout(() => {
        checkController = new AbortController();
        void checkBackendReachable(checkController.signal).then((reachable) => {
          if (!cancelled) setIsOfflineModalOpen(!reachable);
        });
      }, NETWORK_CHANGE_CHECK_DELAY_MS);
    };

    const networkPlugin = getNetworkPlugin();
    const listenerPromise = networkPlugin?.addListener(
      "networkStatusChange",
      runNetworkChangeCheck
    );

    return () => {
      cancelled = true;
      checkController.abort();
      clearTimeout(debounceTimeoutId);
      void listenerPromise?.then((listener) => listener.remove());
    };
  }, []);

  return {
    isOfflineModalOpen,
    handleCloseOfflineModal: () => setIsOfflineModalOpen(false),
  };
};
