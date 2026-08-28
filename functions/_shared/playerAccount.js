// noinspection JSUnusedGlobalSymbols

export const EMPTY_ACHIEVEMENTS = JSON.stringify({
  unlockedIds: [],
  wonInHardMode5Plus: false,
  wonIn5GuessesEver: false,
  wonWith7LettersEver: false,
  wonOnFinalGuessEver: false,
  wonWithoutReusingLettersEver: false,
  wonWithMostlyGraysEver: false,
});

export const EMPTY_WORD_CONNOISSEUR = JSON.stringify([]);

export const EMPTY_STATS = JSON.stringify({
  winDistribution: [],
  gamesFailed: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalGames: 0,
  successRate: 0,
});

export const EMPTY_DAILY_STATS = JSON.stringify({
  currentStreak: 0,
  bestStreak: 0,
  totalPlayed: 0,
  totalWon: 0,
  lastCompletedDate: null,
});

export const EMPTY_SETTINGS = JSON.stringify({
  wordLength: 5,
  showGrayCount: true,
  hardMode: false,
  autoGray: true,
  autoGreen: false,
  extraEffects: true,
});

export const ensurePlayerSaveExists = async (db, uid) =>
  db
    .prepare(
      `INSERT INTO player_saves
         (uid, discord_id, achievements, word_connoisseur, stats_normal, stats_hard, daily_stats, settings, background_id, updated_at)
       VALUES (?, NULL, ?, ?, ?, ?, ?, ?, NULL, ?)
       ON CONFLICT(uid) DO NOTHING`
    )
    .bind(
      uid,
      EMPTY_ACHIEVEMENTS,
      EMPTY_WORD_CONNOISSEUR,
      EMPTY_STATS,
      EMPTY_STATS,
      EMPTY_DAILY_STATS,
      EMPTY_SETTINGS,
      new Date().toISOString()
    )
    .run();

export const findPlayerSaveByDiscordId = async (db, discordId) =>
  db
    .prepare(`SELECT uid FROM player_saves WHERE discord_id = ?`)
    .bind(discordId)
    .first();

export const resolveUidForDiscordId = async (db, discordId) => {
  const existingAccount = await findPlayerSaveByDiscordId(db, discordId);
  return existingAccount ? existingAccount.uid : `discord:${discordId}`;
};

export const findPlayerSaveByPlayGamesId = async (db, playGamesId) =>
  db
    .prepare(`SELECT uid FROM player_saves WHERE play_games_id = ?`)
    .bind(playGamesId)
    .first();

export const linkProviderIdToAccount = async (db, uid, column, providerId) => {
  const existingRow = await db
    .prepare(`SELECT ${column} AS value FROM player_saves WHERE uid = ?`)
    .bind(uid)
    .first();

  if (existingRow?.value && existingRow.value !== providerId)
    return { ok: false };

  try {
    const result = await db
      .prepare(
        `UPDATE player_saves SET ${column} = ? WHERE uid = ? AND ${column} IS NULL`
      )
      .bind(providerId, uid)
      .run();

    if (result.meta.changes === 0 && !existingRow?.value) return { ok: false };
  } catch {
    return { ok: false };
  }

  return { ok: true };
};

export const resolveUidForPlayGamesId = async (db, playGamesId) => {
  const existingAccount = await findPlayerSaveByPlayGamesId(db, playGamesId);
  return existingAccount ? existingAccount.uid : `playgames:${playGamesId}`;
};
