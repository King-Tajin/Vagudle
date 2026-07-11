import { useEffect, useState } from "react";
import {
  BACKGROUNDS,
  type BackgroundId,
  saveBackgroundId,
  loadHiddenAttributionIds,
  hideAttributionForever,
  unhideAttribution,
  clearHiddenAttributions,
} from "../lib/backgrounds";

type Return = {
  hiddenAttributionIds: BackgroundId[];
  setHiddenAttributionIds: (v: BackgroundId[]) => void;
  currentBackground: ReturnType<typeof BACKGROUNDS.find>;
  showAttributionButton: boolean;
  handleAttributionHideForeverChange: (hidden: boolean) => void;
  handleRestoreHiddenAttributions: () => void;
};

export const useBackgroundAttribution = (
  backgroundId: BackgroundId
): Return => {
  const [hiddenAttributionIds, setHiddenAttributionIds] = useState<
    BackgroundId[]
  >(() => loadHiddenAttributionIds());

  useEffect(() => {
    saveBackgroundId(backgroundId);
  }, [backgroundId]);

  const handleAttributionHideForeverChange = (hidden: boolean) => {
    if (hidden) {
      hideAttributionForever(backgroundId);
      setHiddenAttributionIds((prev) =>
        prev.includes(backgroundId) ? prev : [...prev, backgroundId]
      );
    } else {
      unhideAttribution(backgroundId);
      setHiddenAttributionIds((prev) =>
        prev.filter((id) => id !== backgroundId)
      );
    }
  };

  const handleRestoreHiddenAttributions = () => {
    clearHiddenAttributions();
    setHiddenAttributionIds([]);
  };

  const currentBackground = BACKGROUNDS.find((b) => b.id === backgroundId);
  const showAttributionButton =
    currentBackground?.kind === "video" &&
    !!currentBackground.attribution &&
    !hiddenAttributionIds.includes(backgroundId);

  return {
    hiddenAttributionIds,
    setHiddenAttributionIds,
    currentBackground,
    showAttributionButton,
    handleAttributionHideForeverChange,
    handleRestoreHiddenAttributions,
  };
};
