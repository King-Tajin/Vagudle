export type BackgroundId = "sprinkles" | "tajin" | "mouse_cam";

export type BackgroundDef = {
  id: BackgroundId;
  desktopLabel: string;
  mobileLabel: string;
  requiresAchievementId?: string;
  kind: "css" | "video";
  videoSrc?: string;
  posterSrc?: string;
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
    id: "mouse_cam",
    desktopLabel: "MOUSE EATING",
    mobileLabel: "MOUSE",
    requiresAchievementId: "guess_mouse",
    kind: "video",
    videoSrc: "/backgrounds/mouse.mp4",
    objectPosition: "65% 65%",
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
