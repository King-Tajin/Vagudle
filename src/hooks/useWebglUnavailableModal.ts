import { useEffect, useState } from "react";
import { BACKGROUNDS } from "../lib/backgrounds";
import { subscribeToWebglUnavailable } from "../lib/webglSupport";

export const useWebglUnavailableModal = () => {
  const [isWebglUnavailableModalOpen, setIsWebglUnavailableModalOpen] =
    useState(false);
  const [webglUnavailableBackgroundLabel, setWebglUnavailableBackgroundLabel] =
    useState<string | null>(null);

  useEffect(() => {
    return subscribeToWebglUnavailable((backgroundId) => {
      const bg = BACKGROUNDS.find((b) => b.id === backgroundId);
      setWebglUnavailableBackgroundLabel(bg?.desktopLabel ?? null);
      setIsWebglUnavailableModalOpen(true);
    });
  }, []);

  return {
    isWebglUnavailableModalOpen,
    webglUnavailableBackgroundLabel,
    handleCloseWebglUnavailableModal: () =>
      setIsWebglUnavailableModalOpen(false),
  };
};
