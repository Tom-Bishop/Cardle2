-- Add separate tracking for daily and random mode stats
ALTER TABLE stats ADD COLUMN daily_played INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_won INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_max_streak INTEGER NOT NULL DEFAULT 0;

ALTER TABLE stats ADD COLUMN random_played INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_won INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_streak INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_max_streak INTEGER NOT NULL DEFAULT 0;

-- Add last_daily_play column if it doesn't exist
ALTER TABLE stats ADD COLUMN last_daily_play TEXT;

-- Create new API endpoint file for stats handling
