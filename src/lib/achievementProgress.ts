export type ProgressSource =
  "totalWins" | "uniqueWordCount" | "currentWinStreak";

export type ProgressRule = {
  target: number;
  source: ProgressSource;
};

export const ACHIEVEMENT_PROGRESS = {
  win_15: { target: 15, source: "totalWins" },
  win_50: { target: 50, source: "totalWins" },
  word_connoisseur: { target: 200, source: "uniqueWordCount" },
  on_a_roll: { target: 5, source: "currentWinStreak" },
  unstoppable: { target: 15, source: "currentWinStreak" },
} as const satisfies Record<string, ProgressRule>;

export const WIDGET_ONLY_PROGRESS = {
  first_win: { target: 1, source: "totalWins" },
} as const satisfies Record<string, ProgressRule>;

const modalRules: Record<string, ProgressRule> = ACHIEVEMENT_PROGRESS;
const widgetRules: Record<string, ProgressRule> = {
  ...WIDGET_ONLY_PROGRESS,
  ...ACHIEVEMENT_PROGRESS,
};

export const getAchievementProgressRule = (
  id: string
): ProgressRule | undefined => modalRules[id];

export const getWidgetProgressRule = (id: string): ProgressRule | undefined =>
  widgetRules[id];
