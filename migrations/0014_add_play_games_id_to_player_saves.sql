ALTER TABLE player_saves ADD COLUMN play_games_id TEXT;

CREATE INDEX IF NOT EXISTS idx_player_saves_play_games_id ON player_saves(play_games_id);

CREATE UNIQUE INDEX IF NOT EXISTS idx_player_saves_play_games_id_unique
  ON player_saves(play_games_id)
  WHERE play_games_id IS NOT NULL;
