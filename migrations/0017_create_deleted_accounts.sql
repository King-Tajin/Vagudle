CREATE TABLE IF NOT EXISTS deleted_accounts (
  uid TEXT PRIMARY KEY,
  deleted_at INTEGER NOT NULL,
  restarted_at INTEGER
);
