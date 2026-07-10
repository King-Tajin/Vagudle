import { COMPLETIONIST_ID } from "./achievements";

export type BackgroundId =
  | "sprinkles"
  | "tajin"
  | "mouse_eating"
  | "spinning_seal"
  | "number_rain"
  | "seven_letters"
  | "carrots"
  | "pulsing_purple"
  | "letter_rain"
  | "snowfall"
  | "dvd_screensaver"
  | "escalating_fire";

export type AttributionCredit = {
  role: string;
  title: string;
  creator: string;
  sourceUrl?: string;
};

export type BackgroundAttribution = {
  credits: AttributionCredit[];
  license: string;
};

export type BackgroundDef = {
  id: BackgroundId;
  desktopLabel: string;
  mobileLabel: string;
  requiresAchievementId?: string;
  kind: "css" | "video";
  videoSrc?: string;
  objectPosition?: string;
  attribution?: BackgroundAttribution;
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
    attribution: {
      credits: [
        {
          role: "Video",
          title:
            "Mouse eating M&M's with peaceful music for 10 minutes. (He will keep you company and be your friend)",
          creator: "June Hargadon",
          sourceUrl: "https://www.youtube.com/watch?v=bBRgYIvaL00",
        },
        {
          role: "Animation",
          title: "Creature Comforts",
          creator: "Aardman Animations",
        },
        {
          role: "Music",
          title: "New Home (Slowed)",
          creator: "Austin Farwell",
        },
      ],
      license: "Unknown",
    },
  },
  {
    id: "spinning_seal",
    desktopLabel: "SPINNING SEAL",
    mobileLabel: "SEAL",
    requiresAchievementId: COMPLETIONIST_ID,
    kind: "video",
    videoSrc: "/backgrounds/seal.mp4",
    attribution: {
      credits: [
        {
          role: "Video",
          title: "there is no need to be upset",
          creator: "High Valley",
          sourceUrl: "https://www.youtube.com/watch?v=GJDNkVDGM_s&t=14s",
        },
        {
          role: "Music",
          title: "Happy H. Christmas",
          creator: "Maniacs of Noise",
        },
      ],
      license: "Unknown",
    },
  },
  {
    id: "number_rain",
    desktopLabel: "NUMBER RAIN",
    mobileLabel: "NUMBERS",
    requiresAchievementId: "fifth_guess",
    kind: "video",
    videoSrc: "/backgrounds/number_rain.mp4",
    attribution: {
      credits: [
        {
          role: "Video",
          title: "Matrix Rain Codes (4K FULL HD)",
          creator: "Fatih Kalkan",
          sourceUrl: "https://www.youtube.com/watch?v=MUVo20q6tx8",
        },
      ],
      license: "Unknown",
    },
  },
  {
    id: "seven_letters",
    desktopLabel: "SEVEN LETTER WORDS",
    mobileLabel: "WORDS",
    requiresAchievementId: "seven_letters",
    kind: "css",
  },
  {
    id: "carrots",
    desktopLabel: "SPINNING CARROTS",
    mobileLabel: "CARROTS",
    requiresAchievementId: "win_50",
    kind: "css",
  },
  {
    id: "pulsing_purple",
    desktopLabel: "PULSING PURPLE",
    mobileLabel: "PURPLE",
    requiresAchievementId: "win_15",
    kind: "css",
  },
  {
    id: "letter_rain",
    desktopLabel: "LETTER RAIN",
    mobileLabel: "LETTERS",
    requiresAchievementId: "word_connoisseur",
    kind: "css",
  },
  {
    id: "snowfall",
    desktopLabel: "SNOWFALL",
    mobileLabel: "SNOW",
    requiresAchievementId: "close_but_no_cigar",
    kind: "css",
  },
  {
    id: "dvd_screensaver",
    desktopLabel: "DVD SCREENSAVER",
    mobileLabel: "DVD",
    requiresAchievementId: "hard_5plus",
    kind: "css",
  },
  {
    id: "escalating_fire",
    desktopLabel: "ESCALATING FIRE",
    mobileLabel: "FIRE",
    requiresAchievementId: "unstoppable",
    kind: "css",
  },
];

export const BG_KEY = "vagudle-bg-theme";

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

export const ATTRIBUTION_HIDDEN_KEY = "vagudle-attribution-hidden";

export const loadHiddenAttributionIds = (): BackgroundId[] => {
  try {
    const stored = localStorage.getItem(ATTRIBUTION_HIDDEN_KEY);
    if (!stored) return [];
    const parsed: unknown = JSON.parse(stored);
    if (Array.isArray(parsed)) return parsed as BackgroundId[];
  } catch {}
  return [];
};

export const hideAttributionForever = (id: BackgroundId): void => {
  try {
    const hidden = loadHiddenAttributionIds();
    if (!hidden.includes(id)) {
      localStorage.setItem(
        ATTRIBUTION_HIDDEN_KEY,
        JSON.stringify([...hidden, id])
      );
    }
  } catch {}
};

export const unhideAttribution = (id: BackgroundId): void => {
  try {
    const hidden = loadHiddenAttributionIds();
    localStorage.setItem(
      ATTRIBUTION_HIDDEN_KEY,
      JSON.stringify(hidden.filter((hiddenId) => hiddenId !== id))
    );
  } catch {}
};

export const clearHiddenAttributions = (): void => {
  try {
    localStorage.removeItem(ATTRIBUTION_HIDDEN_KEY);
  } catch {}
};
