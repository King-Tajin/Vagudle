ALTER TABLE daily_leaderboard
ADD COLUMN username_updated_at TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_leaderboard_username_unique ON daily_leaderboard (username COLLATE NOCASE)
WHERE
  username IS NOT NULL;
