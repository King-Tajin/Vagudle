CREATE TABLE IF NOT EXISTS daily_leaderboard (
  uid              TEXT PRIMARY KEY,
  username         TEXT,
  wins             INTEGER NOT NULL DEFAULT 0,
  losses           INTEGER NOT NULL DEFAULT 0,
  current_streak   INTEGER NOT NULL DEFAULT 0,
  best_streak      INTEGER NOT NULL DEFAULT 0,
  last_result_date TEXT,
  updated_at       TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_daily_leaderboard_best_streak
  ON daily_leaderboard(best_streak DESC, wins DESC);
