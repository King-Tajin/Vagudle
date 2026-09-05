CREATE UNIQUE INDEX IF NOT EXISTS idx_player_saves_discord_id_unique ON player_saves (discord_id)
WHERE
  discord_id IS NOT NULL;
