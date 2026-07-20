import { lazy } from "react";

export const InfoModal = lazy(() =>
  import("./components/modals/InfoModal").then((m) => ({
    default: m.InfoModal,
  }))
);
export const FlakeRain = lazy(() =>
  import("./components/backgrounds/FlakeRain").then((m) => ({
    default: m.FlakeRain,
  }))
);
export const StatsModal = lazy(() =>
  import("./components/modals/StatsModal").then((m) => ({
    default: m.StatsModal,
  }))
);
export const SettingsModal = lazy(() =>
  import("./components/modals/SettingsModal").then((m) => ({
    default: m.SettingsModal,
  }))
);
export const AttributionModal = lazy(() =>
  import("./components/modals/AttributionModal").then((m) => ({
    default: m.AttributionModal,
  }))
);
export const ChallengeAcceptModal = lazy(() =>
  import("./components/modals/ChallengeAcceptModal").then((m) => ({
    default: m.ChallengeAcceptModal,
  }))
);
export const DuelModal = lazy(() =>
  import("./components/modals/DuelModal").then((m) => ({
    default: m.DuelModal,
  }))
);
export const WinCelebration = lazy(() =>
  import("./components/screens/WinCelebration").then((m) => ({
    default: m.WinCelebration,
  }))
);
export const AchievementReveal = lazy(() =>
  import("./components/screens/AchievementReveal").then((m) => ({
    default: m.AchievementReveal,
  }))
);
export const SevenLetterWords = lazy(() =>
  import("./components/backgrounds/SevenLetterWords").then((m) => ({
    default: m.SevenLetterWords,
  }))
);
export const VideoBackground = lazy(() =>
  import("./components/backgrounds/VideoBackground").then((m) => ({
    default: m.VideoBackground,
  }))
);
export const SpinningCarrots = lazy(() =>
  import("./components/backgrounds/SpinningCarrots").then((m) => ({
    default: m.SpinningCarrots,
  }))
);
export const PulsingPurple = lazy(() =>
  import("./components/backgrounds/PulsingPurple").then((m) => ({
    default: m.PulsingPurple,
  }))
);
export const LetterRain = lazy(() =>
  import("./components/backgrounds/LetterRain").then((m) => ({
    default: m.LetterRain,
  }))
);
export const Snowfall = lazy(() =>
  import("./components/backgrounds/Snowfall").then((m) => ({
    default: m.Snowfall,
  }))
);
export const DvdScreensaver = lazy(() =>
  import("./components/backgrounds/DvdScreensaver").then((m) => ({
    default: m.DvdScreensaver,
  }))
);
export const FireStreak = lazy(() =>
  import("./components/backgrounds/FireStreak").then((m) => ({
    default: m.FireStreak,
  }))
);
export const Fireworks = lazy(() =>
  import("./components/backgrounds/Fireworks").then((m) => ({
    default: m.Fireworks,
  }))
);
export const DuckParade = lazy(() =>
  import("./components/backgrounds/DuckParade").then((m) => ({
    default: m.DuckParade,
  }))
);
export const AchievementsModal = lazy(() =>
  import("./components/modals/AchievementsModal").then((m) => ({
    default: m.AchievementsModal,
  }))
);

export const MalformedChallengeScreen = lazy(() =>
  import("./components/screens/ErrorScreens").then((m) => ({
    default: m.MalformedChallengeScreen,
  }))
);
export const MalformedDuelScreen = lazy(() =>
  import("./components/screens/ErrorScreens").then((m) => ({
    default: m.MalformedDuelScreen,
  }))
);
export const ExpiredDuelScreen = lazy(() =>
  import("./components/screens/ErrorScreens").then((m) => ({
    default: m.ExpiredDuelScreen,
  }))
);
export const ActivityNotFoundScreen = lazy(() =>
  import("./components/screens/ErrorScreens").then((m) => ({
    default: m.ActivityNotFoundScreen,
  }))
);
export const ActivityWrongPlayerScreen = lazy(() =>
  import("./components/screens/ErrorScreens").then((m) => ({
    default: m.ActivityWrongPlayerScreen,
  }))
);
export const ActivityServerErrorScreen = lazy(() =>
  import("./components/screens/ErrorScreens").then((m) => ({
    default: m.ActivityServerErrorScreen,
  }))
);
export const CloudSaveConflictModal = lazy(() =>
  import("./components/modals/CloudSaveConflictModal").then((m) => ({
    default: m.CloudSaveConflictModal,
  }))
);
