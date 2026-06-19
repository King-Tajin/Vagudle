export type BackgroundId = "sprinkles" | "tajin" | "mouse_eating" | "number_rain";

export type BackgroundDef = {
  id: BackgroundId;
  desktopLabel: string;
  mobileLabel: string;
  requiresAchievementId?: string;
  kind: "css" | "video";
  videoSrc?: string;
  objectPosition?: string;
};

export const BACKGROUNDS: BackgroundDef[] = [
  {
    id: "sprinkles",
    desktopLabel: "VAGUDLE SPRINKLES",
    mobileLabel: "GRAY",
    kind: "css",
  },
  {
    id: "tajin",
    desktopLabel: "TAJIN RAIN",
    mobileLabel: "GRID",
    kind: "css",
  },
  {
    id: "mouse_eating",
    desktopLabel: "MOUSE EATING M&M",
    mobileLabel: "MOUSE",
    requiresAchievementId: "guess_mouse",
    kind: "video",
    videoSrc: "/backgrounds/mouse_v2.mp4",
    objectPosition: "65% 65%",
  },
  {
    id: "number_rain",
    desktopLabel: "NUMBER RAIN",
    mobileLabel: "NUMBERS",
    requiresAchievementId: "fifth_guess",
    kind: "video",
    videoSrc: "/backgrounds/number_rain.mp4",
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
