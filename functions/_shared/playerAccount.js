export const findPlayerSaveByDiscordId = async (db, discordId) =>
  db
    .prepare(`SELECT uid FROM player_saves WHERE discord_id = ?`)
    .bind(discordId)
    .first();

export const resolveUidForDiscordId = async (db, discordId) => {
  const existingAccount = await findPlayerSaveByDiscordId(db, discordId);
  return existingAccount ? existingAccount.uid : `discord:${discordId}`;
};
