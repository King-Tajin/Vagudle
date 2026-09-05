ALTER TABLE player_saves
ADD COLUMN daily_stats TEXT NOT NULL DEFAULT '{"currentStreak":0,"bestStreak":0,"totalPlayed":0,"totalWon":0,"lastCompletedDate":null}';
