CREATE TABLE IF NOT EXISTS player_saves (
  uid               TEXT PRIMARY KEY,
  discord_id        TEXT,
  achievements      TEXT NOT NULL,
  word_connoisseur  TEXT NOT NULL,
  stats_normal      TEXT NOT NULL,
  stats_hard        TEXT NOT NULL,
  settings          TEXT NOT NULL,
  background_id     TEXT,
  updated_at        TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_player_saves_discord_id ON player_saves(discord_id);
