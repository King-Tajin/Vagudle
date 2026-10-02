import { useEffect, useState } from "react";

const ACHIEVEMENT_PARAM = "achievement";

type AchievementsDeepLink = {
  shouldOpen: boolean;
  achievementId: string | null;
};

const readDeepLink = (): AchievementsDeepLink => {
  const value = new URLSearchParams(window.location.search).get(
    ACHIEVEMENT_PARAM
  );
  return { shouldOpen: value !== null, achievementId: value || null };
};

export const useAchievementsDeepLink = () => {
  const [initial] = useState(readDeepLink);
  const [focusAchievementId, setFocusAchievementId] = useState<string | null>(
    initial.achievementId
  );

  useEffect(() => {
    if (!initial.shouldOpen) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(ACHIEVEMENT_PARAM);
    window.history.replaceState(window.history.state, document.title, url);
  }, [initial.shouldOpen]);

  return {
    shouldOpenAchievements: initial.shouldOpen,
    focusAchievementId,
    clearFocusAchievementId: () => setFocusAchievementId(null),
  };
};
