import { useEffect, useState } from "react";

const STATS_PARAM = "stats";

const readShouldOpen = () =>
  new URLSearchParams(window.location.search).has(STATS_PARAM);

export const useStatsDeepLink = () => {
  const [shouldOpenStats] = useState(readShouldOpen);

  useEffect(() => {
    if (!shouldOpenStats) return;
    const url = new URL(window.location.href);
    url.searchParams.delete(STATS_PARAM);
    window.history.replaceState(window.history.state, document.title, url);
  }, [shouldOpenStats]);

  return { shouldOpenStats };
};
