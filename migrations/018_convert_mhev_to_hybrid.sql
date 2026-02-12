-- Convert MHEV (Mild Hybrid Electric Vehicle) cars from ICE to Hybrid
-- These are models that typically have mild hybrid technology in their current generation

-- Audi MHEV models (most recent generations have 48V mild hybrid systems)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Audi' AND model IN ('A3 Sportback', 'A4 Avant', 'A4 Saloon', 'A5 Sportback', 'A6 Avant', 'A6 Saloon', 'A7 Sportback', 'A8', 'Q3', 'Q5', 'Q7', 'Q8');

-- BMW MHEV models (48V mild hybrid systems)
UPDATE cars SET power = 'Hybrid' WHERE make = 'BMW' AND model IN ('X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7');

-- Ford Puma is primarily MHEV
UPDATE cars SET power = 'Hybrid' WHERE make = 'Ford' AND model = 'Puma';

-- Hyundai MHEV models (48V systems standard on many models)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Hyundai' AND model IN ('Tucson', 'Santa Fe', 'i20', 'i30 Fastback', 'i30 Hatchback');

-- Jaguar F-Type has MHEV options
UPDATE cars SET power = 'Hybrid' WHERE make = 'Jaguar' AND model IN ('F-Type Convertible', 'F-Type Coupe');

-- Kia MHEV models (48V systems)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Kia' AND model IN ('Sportage', 'Sorento', 'Ceed', 'Ceed Sportswagon', 'ProCeed');

-- Mazda MHEV models (e-Skyactiv X mild hybrid)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Mazda' AND model IN ('CX-5', 'Mazda3 Hatchback', 'Mazda3 Saloon');

-- Mercedes-Benz MHEV models (48V EQ Boost systems)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Mercedes-Benz' AND model IN ('A-Class Saloon', 'B-Class', 'CLA Coupe', 'CLA Shooting Brake');

-- Suzuki MHEV models (mild hybrid systems standard)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Suzuki' AND model IN ('Swift', 'Swift Sport', 'Vitara', 'S-Cross');
