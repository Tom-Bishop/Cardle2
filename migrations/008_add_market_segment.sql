-- Migration 008: Add Market Segment column and populate all cars

ALTER TABLE cars ADD COLUMN segment TEXT;

-- Update all cars with their market segment
UPDATE cars SET segment = 'Urban' WHERE make IN ('Fiat','Dacia','Mini','Smart','Suzuki','Hyundai','Kia') AND body IN ('Hatchback','Crossover') AND (model LIKE '%500%' OR model LIKE '%Panda%' OR model LIKE '%Sandero%' OR model LIKE '%Spring%' OR model LIKE '%Cooper%' OR model LIKE '%Picanto%' OR model LIKE '%i10%' OR model LIKE '%Fiesta%' OR model LIKE '%Corsa%' OR model LIKE '%Clio%');

UPDATE cars SET segment = 'Economy' WHERE (make IN ('Dacia','Hyundai','Kia','Vauxhall') AND body IN ('Hatchback','Saloon') AND model NOT LIKE '%PHEV%') OR (make = 'Ford' AND model IN ('Ka','Fiesta') AND body = 'Hatchback');

UPDATE cars SET segment = 'Urban' WHERE make IN ('Mini','Fiat') AND body IN ('Hatchback','Convertible','Wagon');

UPDATE cars SET segment = 'Family' WHERE (make IN ('Ford','Vauxhall','Renault','Citroen','Peugeot') AND body IN ('MPV','Wagon','Estate')) OR (make IN ('Toyota','Honda','Nissan','Mazda','Kia','Hyundai') AND body = 'SUV' AND model NOT LIKE '%Coupe%' AND (model LIKE '%RAV4%' OR model LIKE '%CR-V%' OR model LIKE '%Qashqai%' OR model LIKE '%CX-5%' OR model LIKE '%Sportage%' OR model LIKE '%Sorento%' OR model LIKE '%Santa Fe%' OR model LIKE '%Tucson%'));

UPDATE cars SET segment = 'Adventure' WHERE make IN ('Land Rover','Jeep','Toyota','Isuzu','Mitsubishi','Suzuki') AND (model LIKE '%Defender%' OR model LIKE '%Wrangler%' OR model LIKE '%Discovery%' OR model LIKE '%Range Rover%' OR model LIKE '%Land Cruiser%' OR model LIKE '%Jimny%' OR model LIKE '%Outlander%' OR model LIKE '%D-Max%' OR model LIKE '%Korando%' OR model LIKE '%Rexton%' OR model LIKE '%Musso%' OR model LIKE '%Hilux%');

UPDATE cars SET segment = 'Executive' WHERE make IN ('BMW','Mercedes-Benz','Audi','Volvo','Skoda','Peugeot','Renault','Citroen') AND (body IN ('Saloon','Estate','Fastback') OR (body = 'SUV' AND (model LIKE '%A4%' OR model LIKE '%A6%' OR model LIKE '%C-Class%' OR model LIKE '%E-Class%' OR model LIKE '%S90%' OR model LIKE '%V60%' OR model LIKE '%V90%' OR model LIKE '%3 Series%' OR model LIKE '%5 Series%' OR model LIKE '%Octavia%' OR model LIKE '%Superb%' OR model LIKE '%XC60%' OR model LIKE '%408%' OR model LIKE '%3008%')));

UPDATE cars SET segment = 'Luxury' WHERE make IN ('Mercedes-Benz','BMW','Audi','Porsche','Jaguar','Range Rover','Lexus','Volvo') AND (model LIKE '%S-Class%' OR model LIKE '%S90%' OR model LIKE '%7 Series%' OR model LIKE '%A8%' OR model LIKE '%S%' OR model LIKE '%XC90%' OR model LIKE '%Range Rover%' OR model LIKE '%LS%' OR model LIKE '%LC%');

UPDATE cars SET segment = 'Performance' WHERE make IN ('Porsche','Ferrari','Lamborghini','Maserati','Jaguar','BMW','Mercedes-Benz','Audi','Cupra') AND (body IN ('Coupe','Convertible','Roadster') OR model LIKE '%GT%' OR model LIKE '%AMG%' OR model LIKE '%M%' OR model LIKE '%911%' OR model LIKE '%F8%' OR model LIKE '%Huracán%' OR model LIKE '%Aventador%' OR model LIKE '%Ghibli%' OR model LIKE '%F-Type%' OR model LIKE '%Supra%' OR model LIKE '%GR %' OR model LIKE '%Type R%' OR model LIKE '%Cupra%');

UPDATE cars SET segment = 'Green' WHERE power IN ('EV','PHEV') AND segment IS NULL;

UPDATE cars SET segment = 'Utility' WHERE body IN ('Van','Pickup') AND segment IS NULL;

-- Set remaining cars to their most appropriate segment based on positioning
UPDATE cars SET segment = 'Family' WHERE segment IS NULL AND body IN ('SUV','MPV','Wagon','Estate');
UPDATE cars SET segment = 'Executive' WHERE segment IS NULL AND body IN ('Saloon','Fastback') AND make NOT IN ('Tesla','Renault','Nissan','Kia','Hyundai','MG','BYD','ORA');
UPDATE cars SET segment = 'Urban' WHERE segment IS NULL AND body IN ('Hatchback','Crossover') AND make IN ('Renault','Nissan','Hyundai','Kia','Vauxhall','Peugeot');
UPDATE cars SET segment = 'Economy' WHERE segment IS NULL AND body IN ('Hatchback','Saloon');
UPDATE cars SET segment = 'Green' WHERE segment IS NULL AND power IN ('EV','PHEV');

-- Final fallback for any remaining NULLs
UPDATE cars SET segment = 'Family' WHERE segment IS NULL;
