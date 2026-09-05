CREATE TABLE IF NOT EXISTS daily_attempts (
  uid TEXT NOT NULL,
  date TEXT NOT NULL,
  platform TEXT NOT NULL,
  group_id TEXT,
  group_type TEXT,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  PRIMARY KEY (uid, date)
);
