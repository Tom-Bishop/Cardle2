-- Migration to generalize body types
-- Maps specific body types to broader categories

-- SUV-Coupe -> SUV
UPDATE cars SET body = 'SUV' WHERE body = 'SUV-Coupe';

-- Shooting Brake -> Estate (both are wagon-like vehicles)
UPDATE cars SET body = 'Estate' WHERE body = 'Shooting Brake';

-- Fastback -> Coupe (fastback is a coupe variant)
UPDATE cars SET body = 'Coupe' WHERE body = 'Fastback';

-- Liftback -> Hatchback (similar rear door configuration)
UPDATE cars SET body = 'Hatchback' WHERE body = 'Liftback';

-- Roadster -> Convertible (both open-top sports cars)
UPDATE cars SET body = 'Convertible' WHERE body = 'Roadster';

-- Crossover -> SUV (crossovers are SUV variants)
UPDATE cars SET body = 'SUV' WHERE body = 'Crossover';

-- Camper -> Van (campers are van-based)
UPDATE cars SET body = 'Van' WHERE body = 'Camper';
