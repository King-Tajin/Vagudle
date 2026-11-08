// noinspection JSUnusedGlobalSymbols

export const rowToSave = (row) => ({
  achievements: row.achievements,
  wordConnoisseur: row.word_connoisseur,
  statsNormal: row.stats_normal,
  statsHard: row.stats_hard,
  dailyStats: row.daily_stats,
  settings: row.settings,
  backgroundId: row.background_id,
  lastPlayedAt: row.last_played_at,
  firstSeenAt: row.first_seen_at,
  updatedAt: row.updated_at,
  rev: row.rev,
});
