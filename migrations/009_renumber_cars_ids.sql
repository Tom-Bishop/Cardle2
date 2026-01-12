-- Migration 009: Renumber cars to start from ID 1

-- Create a new cars table with sequential IDs starting from 1
CREATE TABLE cars_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    body TEXT NOT NULL,
    origin TEXT NOT NULL,
    power TEXT NOT NULL,
    segment TEXT
);

-- Copy all cars from old table to new table in order (this will auto-assign IDs 1, 2, 3, ...)
INSERT INTO cars_new (make, model, body, origin, power, segment)
SELECT make, model, body, origin, power, segment FROM cars ORDER BY id;

-- Drop the old cars table
DROP TABLE cars;

-- Rename the new table to cars
ALTER TABLE cars_new RENAME TO cars;
