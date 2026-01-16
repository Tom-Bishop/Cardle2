-- Migration to fix incorrect brand origins

-- Isuzu: THA -> JPN (Japanese brand, not Thai)
UPDATE cars SET origin = 'JPN' WHERE make = 'Isuzu';

-- Mitsubishi: THA -> JPN (Japanese brand, not Thai)
UPDATE cars SET origin = 'JPN' WHERE make = 'Mitsubishi';

-- Nissan: THA -> JPN (Japanese brand, not Thai)
UPDATE cars SET origin = 'JPN' WHERE make = 'Nissan';

-- Dacia: ROM -> FRA (Renault subsidiary, French parent company)
UPDATE cars SET origin = 'FRA' WHERE make = 'Dacia';

-- MG: CHN -> GBR (British heritage brand, historically British)
UPDATE cars SET origin = 'GBR' WHERE make = 'MG';
