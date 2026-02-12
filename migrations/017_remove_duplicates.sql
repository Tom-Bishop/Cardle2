-- Remove duplicate body type and powertrain variants, keep base models with general names

-- Update base models to have general names (remove "Hatch", "Hatchback" suffixes)
UPDATE cars SET model = '308' WHERE make = 'Peugeot' AND model = '308 Hatch';
UPDATE cars SET model = '408' WHERE make = 'Peugeot' AND model = '408 Fastback';
UPDATE cars SET model = 'Octavia' WHERE make = 'Skoda' AND model = 'Octavia Hatch';
UPDATE cars SET model = 'Superb' WHERE make = 'Skoda' AND model = 'Superb Hatch';
UPDATE cars SET model = 'Corolla' WHERE make = 'Toyota' AND model = 'Corolla Hatchback';

-- Delete body type duplicates (Estate/SW variants)
DELETE FROM cars WHERE make = 'SEAT' AND model = 'Leon Estate';
DELETE FROM cars WHERE make = 'Peugeot' AND model = '308 SW';
DELETE FROM cars WHERE make = 'Skoda' AND model = 'Octavia Estate';
DELETE FROM cars WHERE make = 'Skoda' AND model = 'Superb Estate';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Astra Sports Tourer';
DELETE FROM cars WHERE make = 'Volkswagen' AND model = 'Passat Estate';
DELETE FROM cars WHERE make = 'Toyota' AND model = 'Corolla Saloon';
DELETE FROM cars WHERE make = 'Toyota' AND model = 'Corolla Touring Sports';
DELETE FROM cars WHERE make = 'Porsche' AND model = 'Taycan Cross Turismo';

-- Delete powertrain duplicates (Hybrid/Electric variants)
DELETE FROM cars WHERE make = 'Peugeot' AND model = '3008 Hybrid';
DELETE FROM cars WHERE make = 'Peugeot' AND model = '308 Hybrid';
DELETE FROM cars WHERE make = 'Peugeot' AND model = '408 Hybrid';
DELETE FROM cars WHERE make = 'Peugeot' AND model = 'e-2008';
DELETE FROM cars WHERE make = 'Peugeot' AND model = 'e-208';
DELETE FROM cars WHERE make = 'SEAT' AND model = 'Leon e-HYBRID';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Astra Plug-in Hybrid';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Astra GSe';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Corsa Electric';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Corsa GSe';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Mokka Electric';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Mokka GSe';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Grandland Hybrid';
DELETE FROM cars WHERE make = 'Volkswagen' AND model = 'Golf GTE';
DELETE FROM cars WHERE make = 'Volkswagen' AND model = 'Tiguan eHybrid';
DELETE FROM cars WHERE make = 'Renault' AND model = 'Captur E-Tech';
DELETE FROM cars WHERE make = 'Renault' AND model = 'Austral E-Tech';
DELETE FROM cars WHERE make = 'Renault' AND model = 'Kangoo E-Tech';
DELETE FROM cars WHERE make = 'Nissan' AND model = 'Juke Hybrid';
DELETE FROM cars WHERE make = 'Nissan' AND model = 'Qashqai e-POWER';
DELETE FROM cars WHERE make = 'Nissan' AND model = 'X-Trail e-POWER';
DELETE FROM cars WHERE make = 'Nissan' AND model = 'Townstar Electric';
DELETE FROM cars WHERE make = 'Nissan' AND model = 'Ariya e-4ORCE';
DELETE FROM cars WHERE make = 'Volvo' AND model = 'XC40 Recharge';
DELETE FROM cars WHERE make = 'Volvo' AND model = 'XC60 Recharge';
DELETE FROM cars WHERE make = 'Volvo' AND model = 'XC90 Recharge';
DELETE FROM cars WHERE make = 'Volvo' AND model = 'V60 Recharge';
DELETE FROM cars WHERE make = 'Toyota' AND model = 'RAV4 Plug-in Hybrid';
DELETE FROM cars WHERE make = 'Porsche' AND model = 'Cayenne E-Hybrid';
DELETE FROM cars WHERE make = 'Kia' AND model = 'Sportage Hybrid';
DELETE FROM cars WHERE make = 'Hyundai' AND model = 'Tucson Hybrid';
DELETE FROM cars WHERE make = 'Hyundai' AND model = 'Ioniq Hybrid';
DELETE FROM cars WHERE make = 'Honda' AND model = 'CR-V Hybrid';
DELETE FROM cars WHERE make = 'Ford' AND model = 'Kuga PHEV';
DELETE FROM cars WHERE make = 'Citroen' AND model = 'e-Berlingo';

-- Delete van electric duplicates
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Combo Electric';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Movano Electric';
DELETE FROM cars WHERE make = 'Vauxhall' AND model = 'Vivaro Electric';
DELETE FROM cars WHERE make = 'Toyota' AND model = 'Proace Electric';
DELETE FROM cars WHERE make = 'Toyota' AND model = 'Proace City Electric';
DELETE FROM cars WHERE make = 'Renault' AND model = 'Master E-Tech';
DELETE FROM cars WHERE make = 'Ford' AND model = 'E-Transit Custom';
DELETE FROM cars WHERE make = 'Citroen' AND model = 'e-Dispatch';

-- Delete Skoda iV variants
DELETE FROM cars WHERE make = 'Skoda' AND model = 'Octavia iV';
DELETE FROM cars WHERE make = 'Skoda' AND model = 'Superb iV';
