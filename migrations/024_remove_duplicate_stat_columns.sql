-- Migration 024: Remove duplicate stat columns
-- Keep: daily_plays, daily_wins, random_plays, random_wins
-- Remove: daily_played, daily_won, random_played, random_won

BEGIN TRANSACTION;

-- Create new stats table without the duplicate columns
CREATE TABLE stats_new (
    user_id TEXT PRIMARY KEY,
    xp INTEGER NOT NULL DEFAULT 0,
    level INTEGER NOT NULL DEFAULT 1,
    streak_days INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    games_played INTEGER NOT NULL DEFAULT 0,
    total_guesses INTEGER NOT NULL DEFAULT 0,
    total_time_seconds INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL,
    max_streak INTEGER NOT NULL DEFAULT 0,
    last_daily_play TEXT,
    daily_plays INTEGER NOT NULL DEFAULT 0,
    daily_wins INTEGER NOT NULL DEFAULT 0,
    daily_streak INTEGER NOT NULL DEFAULT 0,
    daily_max_streak INTEGER NOT NULL DEFAULT 0,
    daily_losses INTEGER NOT NULL DEFAULT 0,
    daily_guesses INTEGER NOT NULL DEFAULT 0,
    daily_time INTEGER NOT NULL DEFAULT 0,
    random_plays INTEGER NOT NULL DEFAULT 0,
    random_wins INTEGER NOT NULL DEFAULT 0,
    random_streak INTEGER NOT NULL DEFAULT 0,
    random_max_streak INTEGER NOT NULL DEFAULT 0,
    random_losses INTEGER NOT NULL DEFAULT 0,
    random_guesses INTEGER NOT NULL DEFAULT 0,
    random_time INTEGER NOT NULL DEFAULT 0,
    total_plays INTEGER NOT NULL DEFAULT 0,
    total_wins INTEGER NOT NULL DEFAULT 0,
    total_losses INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY(user_id) REFERENCES users(id)
);

-- Copy data from old table to new table (excluding duplicate columns)
INSERT INTO stats_new 
SELECT 
    user_id, xp, level, streak_days, wins, games_played, total_guesses, 
    total_time_seconds, updated_at, max_streak, last_daily_play,
    daily_plays, daily_wins, daily_streak, daily_max_streak,
    daily_losses, daily_guesses, daily_time,
    random_plays, random_wins, random_streak, random_max_streak,
    random_losses, random_guesses, random_time,
    total_plays, total_wins, total_losses
FROM stats;

-- Remove old table and rename new one
DROP TABLE stats;
ALTER TABLE stats_new RENAME TO stats;

-- Recreate the index
CREATE INDEX IF NOT EXISTS idx_stats_xp ON stats(xp DESC);

COMMIT;
