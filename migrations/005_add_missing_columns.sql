-- Add only the missing daily and random stats columns
-- Some columns may already exist from partial migrations

ALTER TABLE stats ADD COLUMN daily_played INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_won INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_max_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE stats ADD COLUMN random_played INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_won INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_max_streak INTEGER NOT NULL DEFAULT 0;
