-- Migration 025: Copy data from old duplicate columns to new deduplicated columns
-- This ensures existing user data is preserved when we switch to using the new column names

-- Copy data from old columns to new columns (only if new columns are empty/0)
UPDATE stats
SET 
    daily_plays = COALESCE(daily_played, daily_plays, 0),
    daily_wins = COALESCE(daily_won, daily_wins, 0),
    random_plays = COALESCE(random_played, random_plays, 0),
    random_wins = COALESCE(random_won, random_wins, 0)
WHERE daily_plays = 0 OR random_plays = 0;
