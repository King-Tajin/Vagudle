import { useEffect, useState } from "react";
import { ENABLE_OFFLINE_MODE } from "../constants/settings";
import { checkBackendReachable } from "../lib/offlineMode";

export const useOfflineModeCheck = () => {
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  useEffect(() => {
    if (!ENABLE_OFFLINE_MODE) return;
    const controller = new AbortController();
    let cancelled = false;

    void checkBackendReachable(controller.signal).then((reachable) => {
      if (!cancelled && !reachable) {
        setIsOfflineModalOpen(true);
      }
    });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  return {
    isOfflineModalOpen,
    handleCloseOfflineModal: () => setIsOfflineModalOpen(false),
  };
};
