-- Add password storage and max streak tracking
ALTER TABLE users ADD COLUMN password_hash TEXT;

ALTER TABLE stats ADD COLUMN max_streak INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_stats_max_streak ON stats(max_streak DESC);
