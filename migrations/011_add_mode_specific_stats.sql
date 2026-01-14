-- Add mode-specific stats columns for daily and random modes
-- Includes: plays, wins, losses, guesses (total), time (total in seconds), and streak

-- Daily Challenge stats
ALTER TABLE stats ADD COLUMN daily_plays INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_losses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_guesses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_time INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN daily_streak INTEGER NOT NULL DEFAULT 0;

-- Random Mode stats
ALTER TABLE stats ADD COLUMN random_plays INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_losses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_guesses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN random_time INTEGER NOT NULL DEFAULT 0;

-- Overall stats (optional, for future use)
ALTER TABLE stats ADD COLUMN total_plays INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN total_wins INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN total_losses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN total_guesses INTEGER NOT NULL DEFAULT 0;
ALTER TABLE stats ADD COLUMN total_time INTEGER NOT NULL DEFAULT 0;
