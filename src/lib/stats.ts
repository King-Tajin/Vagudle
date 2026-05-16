import { MAX_CHALLENGES } from "../constants/settings";
import {
  GameStats,
  loadStatsFromLocalStorage,
  saveStatsToLocalStorage,
} from "./localStorage";

export const addStatsForCompletedGame = (
  gameStats: GameStats,
  count: number,
  maxChallenges: number
) => {
  const stats = { ...gameStats };

  stats.totalGames += 1;

  if (count >= maxChallenges) {
    stats.currentStreak = 0;
    stats.gamesFailed += 1;
  } else {
    stats.winDistribution[count] += 1;
    stats.currentStreak += 1;

    if (stats.bestStreak < stats.currentStreak) {
      stats.bestStreak = stats.currentStreak;
    }
  }

  stats.successRate = getSuccessRate(stats);

  return stats;
};

const defaultStats: GameStats = {
  winDistribution: Array.from(new Array(MAX_CHALLENGES), () => 0),
  gamesFailed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  successRate: 0,
};

export const loadStats = (hardMode: boolean) => {
  const stored = loadStatsFromLocalStorage(hardMode);
  if (!stored) {
    return {
      ...defaultStats,
      winDistribution: Array.from(new Array(MAX_CHALLENGES), () => 0),
    };
  }
  if (stored.winDistribution.length < MAX_CHALLENGES) {
    stored.winDistribution = [
      ...stored.winDistribution,
      ...Array(MAX_CHALLENGES - stored.winDistribution.length).fill(0),
    ];
  }
  return stored;
};

const getSuccessRate = (gameStats: GameStats) => {
  const { totalGames, gamesFailed } = gameStats;

  return Math.round(
    (100 * (totalGames - gamesFailed)) / Math.max(totalGames, 1)
  );
};

export { saveStatsToLocalStorage };