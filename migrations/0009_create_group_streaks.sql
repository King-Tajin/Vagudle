CREATE TABLE IF NOT EXISTS group_streaks (
  group_id         TEXT PRIMARY KEY,
  group_type       TEXT NOT NULL,
  current_streak   INTEGER NOT NULL DEFAULT 0,
  best_streak      INTEGER NOT NULL DEFAULT 0,
  last_played_date TEXT,
  updated_at       TEXT NOT NULL
);
