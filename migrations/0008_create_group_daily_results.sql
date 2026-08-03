CREATE TABLE IF NOT EXISTS group_daily_results (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id      TEXT    NOT NULL,
  group_type    TEXT    NOT NULL,
  date          TEXT    NOT NULL,
  uid           TEXT    NOT NULL,
  discord_id    TEXT    NOT NULL,
  won           INTEGER NOT NULL,
  guesses_used  INTEGER,
  submitted_at  TEXT    NOT NULL,
  UNIQUE(group_id, date, uid)
);

CREATE INDEX IF NOT EXISTS idx_group_daily_results_group_date
  ON group_daily_results(group_id, date, submitted_at);
