-- Add guess_number column to capture which attempt a guess was made on
ALTER TABLE guess_history ADD COLUMN guess_number INTEGER;

-- Index to help filter by first guess
CREATE INDEX IF NOT EXISTS idx_guess_history_guess_number ON guess_history(guess_number);
