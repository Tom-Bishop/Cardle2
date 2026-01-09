-- Add last_daily_play column to track server-side daily play per user
ALTER TABLE stats ADD COLUMN last_daily_play TEXT;

-- optional index for queries by last_daily_play
CREATE INDEX IF NOT EXISTS idx_stats_last_daily_play ON stats(last_daily_play);
