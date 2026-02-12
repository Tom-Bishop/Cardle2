-- Revert MHEV cars back from Hybrid to ICE

-- Revert Audi models
UPDATE cars SET power = 'ICE' WHERE make = 'Audi' AND model IN ('A3 Sportback', 'A4 Avant', 'A4 Saloon', 'A5 Sportback', 'A6 Avant', 'A6 Saloon', 'A7 Sportback', 'A8', 'Q3', 'Q5', 'Q7', 'Q8');

-- Revert BMW models
UPDATE cars SET power = 'ICE' WHERE make = 'BMW' AND model IN ('X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7');

-- Revert Ford Puma
UPDATE cars SET power = 'ICE' WHERE make = 'Ford' AND model = 'Puma';

-- Revert Hyundai models
UPDATE cars SET power = 'ICE' WHERE make = 'Hyundai' AND model IN ('Tucson', 'Santa Fe', 'i20', 'i30 Fastback', 'i30 Hatchback');

-- Revert Jaguar F-Type
UPDATE cars SET power = 'ICE' WHERE make = 'Jaguar' AND model IN ('F-Type Convertible', 'F-Type Coupe');

-- Revert Kia models
UPDATE cars SET power = 'ICE' WHERE make = 'Kia' AND model IN ('Sportage', 'Sorento', 'Ceed', 'Ceed Sportswagon', 'ProCeed');

-- Revert Mazda models
UPDATE cars SET power = 'ICE' WHERE make = 'Mazda' AND model IN ('CX-5', 'Mazda3 Hatchback', 'Mazda3 Saloon');

-- Revert Mercedes-Benz models
UPDATE cars SET power = 'ICE' WHERE make = 'Mercedes-Benz' AND model IN ('A-Class Saloon', 'B-Class', 'CLA Coupe', 'CLA Shooting Brake');

-- Revert Suzuki models
UPDATE cars SET power = 'ICE' WHERE make = 'Suzuki' AND model IN ('Swift', 'Swift Sport', 'Vitara', 'S-Cross');
