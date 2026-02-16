-- Migration 026: Fix PHEV power classifications
-- Change all plug-in hybrids currently marked as ICE to Hybrid

-- Audi PHEVs (TFSI e models)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Audi' AND model = 'A3 TFSI e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Audi' AND model = 'A6 TFSI e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Audi' AND model = 'Q3 TFSI e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Audi' AND model = 'Q5 TFSI e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Audi' AND model = 'Q7 TFSI e';

-- BMW PHEVs (e models)
UPDATE cars SET power = 'Hybrid' WHERE make = 'BMW' AND model = '330e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'BMW' AND model = '530e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'BMW' AND model = 'X3 xDrive30e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'BMW' AND model = 'X5 xDrive50e';

-- Mercedes-Benz PHEVs (e models)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Mercedes-Benz' AND model = 'A 250 e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Mercedes-Benz' AND model = 'C 300 e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Mercedes-Benz' AND model = 'E 300 e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Mercedes-Benz' AND model = 'GLC 300 e';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Mercedes-Benz' AND model = 'S 580 e';

-- Jeep PHEVs (4xe models)
UPDATE cars SET power = 'Hybrid' WHERE make = 'Jeep' AND model = 'Compass 4xe';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Jeep' AND model = 'Grand Cherokee 4xe';
UPDATE cars SET power = 'Hybrid' WHERE make = 'Jeep' AND model = 'Renegade 4xe';

-- Hyundai PHEVs
UPDATE cars SET power = 'Hybrid' WHERE make = 'Hyundai' AND model = 'Santa Fe Plug-in Hybrid';

-- Kia PHEVs
UPDATE cars SET power = 'Hybrid' WHERE make = 'Kia' AND model = 'Sportage Plug-in Hybrid';

-- Land Rover PHEVs
UPDATE cars SET power = 'Hybrid' WHERE make = 'Land Rover' AND model = 'Range Rover Sport PHEV';

-- DS Automobiles PHEVs (E-Tense models)
UPDATE cars SET power = 'Hybrid' WHERE make = 'DS Automobiles' AND model = 'DS 3 E-Tense';
UPDATE cars SET power = 'Hybrid' WHERE make = 'DS Automobiles' AND model = 'DS 4 E-Tense';
UPDATE cars SET power = 'Hybrid' WHERE make = 'DS Automobiles' AND model = 'DS 7 E-Tense';
