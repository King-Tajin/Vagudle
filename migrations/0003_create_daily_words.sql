CREATE TABLE IF NOT EXISTS daily_words (
  date TEXT PRIMARY KEY,
  word TEXT NOT NULL,
  word_length INTEGER NOT NULL,
  hard_mode INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);
