-- Create guess history table to track which cars are guessed by users
CREATE TABLE IF NOT EXISTS guess_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  car_id INTEGER NOT NULL,
  car_make TEXT NOT NULL,
  car_model TEXT NOT NULL,
  guessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (car_id) REFERENCES cars(id)
);

-- Create index on username for quick lookups
CREATE INDEX IF NOT EXISTS idx_guess_history_username ON guess_history(username);

-- Create index on car_id for counting guesses per car
CREATE INDEX IF NOT EXISTS idx_guess_history_car_id ON guess_history(car_id);
