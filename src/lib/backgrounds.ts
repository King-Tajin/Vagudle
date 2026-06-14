export type BackgroundId = "sprinkles" | "tajin";

export type BackgroundDef = {
  id: BackgroundId;
  desktopLabel: string;
  mobileLabel: string;
  requiresAchievementId?: string;
};

export const BACKGROUNDS: BackgroundDef[] = [
  {
    id: "sprinkles",
    desktopLabel: "VAGUDLE SPRINKLES",
    mobileLabel: "GRAY",
  },
  {
    id: "tajin",
    desktopLabel: "TAJIN RAIN",
    mobileLabel: "GRID",
  },
];

const BG_KEY = "vagudle-bg-theme";

export const loadBackgroundId = (isMobile: boolean): BackgroundId => {
  try {
    const stored = localStorage.getItem(BG_KEY);
    if (stored && BACKGROUNDS.some((b) => b.id === stored))
      return stored as BackgroundId;
  } catch {}
  return isMobile ? "tajin" : "sprinkles";
};

export const saveBackgroundId = (id: BackgroundId): void => {
  try {
    localStorage.setItem(BG_KEY, id);
  } catch {}
};
