import { ACHIEVEMENTS, COMPLETIONIST_ID } from "./achievements";
import {
  getWidgetProgressRule,
  type ProgressSource,
} from "./achievementProgress";

export type AchievementsWidgetInput = Record<ProgressSource, number> & {
  unlockedIds: string[];
};

const findNextWithCounter = (
  input: AchievementsWidgetInput,
  unlocked: Set<string>
): AchievementsWidgetSyncPayload | null => {
  let best: { title: string; progress: number; target: number } | null = null;
  let bestFraction = -1;

  for (const achievement of ACHIEVEMENTS) {
    const rule = getWidgetProgressRule(achievement.id);
    if (!rule || unlocked.has(achievement.id)) continue;
    const progress = Math.min(Math.max(input[rule.source], 0), rule.target);
    const fraction = progress / rule.target;
    if (fraction > bestFraction) {
      bestFraction = fraction;
      best = { title: achievement.title, progress, target: rule.target };
    }
  }

  if (!best) return null;
  return {
    unlockedCount: unlocked.size,
    totalAchievements: ACHIEVEMENTS.length,
    nextUpTitle: best.title,
    nextUpProgress: best.progress,
    nextUpTarget: best.target,
  };
};

export const buildAchievementsWidgetPayload = (
  input: AchievementsWidgetInput
): AchievementsWidgetSyncPayload => {
  const knownIds = new Set(ACHIEVEMENTS.map((a) => a.id));
  const unlocked = new Set(input.unlockedIds.filter((id) => knownIds.has(id)));
  const base = {
    unlockedCount: unlocked.size,
    totalAchievements: ACHIEVEMENTS.length,
    nextUpProgress: null,
    nextUpTarget: null,
  };

  if (unlocked.size >= ACHIEVEMENTS.length) {
    const completionist = ACHIEVEMENTS.find((a) => a.id === COMPLETIONIST_ID);
    return { ...base, nextUpTitle: completionist?.title ?? "" };
  }

  const withCounter = findNextWithCounter(input, unlocked);
  if (withCounter) return withCounter;

  const firstLocked = ACHIEVEMENTS.find(
    (a) => !a.hidden && !unlocked.has(a.id)
  );
  return { ...base, nextUpTitle: firstLocked?.title ?? "" };
};
