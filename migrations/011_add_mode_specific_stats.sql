-- Add mode-specific stats columns for daily and random modes
-- Only adds missing columns (some already exist from previous migrations)

-- Daily Challenge stats (missing columns only)
ALTER TABLE stats ADD COLUMN daily_losses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_guesses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_time INTEGER NOT NULL DEFAULT 0;

-- Random Mode stats (missing columns only)
ALTER TABLE stats ADD COLUMN random_losses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_guesses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_time INTEGER NOT NULL DEFAULT 0;

-- Add daily and random versions of plays/wins/total columns to be explicit
ALTER TABLE stats ADD COLUMN daily_plays INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_plays INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_wins INTEGER NOT NULL DEFAULT 0;

-- Overall stats totals (NOT total_guesses/total_time_seconds as those already exist)
ALTER TABLE stats ADD COLUMN total_plays INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN total_wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN total_losses INTEGER NOT NULL DEFAULT 0;
