DROP TABLE IF EXISTS duel_results;

CREATE TABLE duel_results (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  duel_id       TEXT    NOT NULL,
  discord_id    TEXT    NOT NULL,
  won           INTEGER,
  guesses_used  INTEGER,
  word          TEXT    NOT NULL,
  word_length   INTEGER NOT NULL,
  dict_type     TEXT    NOT NULL,
  max_guesses   INTEGER NOT NULL,
  generated_at  TEXT    NOT NULL,
  completed_at  TEXT,
  UNIQUE(duel_id, discord_id)
);

CREATE INDEX IF NOT EXISTS idx_duel_results_duel_id ON duel_results(duel_id);
CREATE INDEX IF NOT EXISTS idx_duel_results_discord_id ON duel_results(discord_id);

CREATE TABLE IF NOT EXISTS leaderboard_normal (
  discord_id     TEXT    PRIMARY KEY,
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won    INTEGER NOT NULL DEFAULT 0,
  opponents_won  TEXT    NOT NULL DEFAULT '[]',
  opponents_lost TEXT    NOT NULL DEFAULT '[]'
);

CREATE TABLE IF NOT EXISTS leaderboard_hard (
  discord_id     TEXT    PRIMARY KEY,
  matches_played INTEGER NOT NULL DEFAULT 0,
  matches_won    INTEGER NOT NULL DEFAULT 0,
  opponents_won  TEXT    NOT NULL DEFAULT '[]',
  opponents_lost TEXT    NOT NULL DEFAULT '[]'
);
