-- Migration 013: Recompute market segments (update only, no ALTER)
-- Clears any wiped segment values and reapplies the classification rules

-- Start from a clean slate
UPDATE cars SET segment = NULL;

-- City/urban small cars
UPDATE cars SET segment = 'Urban'
WHERE make IN ('Fiat','Dacia','Mini','MINI','Smart','Suzuki','Hyundai','Kia','Vauxhall','Renault','Peugeot','Toyota','Ford')
  AND body IN ('Hatchback','Crossover')
  AND (
    model LIKE '%500%' OR model LIKE '%Panda%' OR model LIKE '%Sandero%' OR model LIKE '%Spring%' OR
    model LIKE '%Cooper%' OR model LIKE '%Picanto%' OR model LIKE '%i10%' OR model LIKE '%Fiesta%' OR
    model LIKE '%Corsa%' OR model LIKE '%Clio%' OR model LIKE '%Micra%' OR model LIKE '%Aygo%' OR model LIKE '%Yaris%'
  );

-- Budget-friendly compact cars
UPDATE cars SET segment = 'Economy'
WHERE (
    make IN ('Dacia','Hyundai','Kia','Vauxhall','Renault','Peugeot')
    AND body IN ('Hatchback','Saloon','Crossover')
    AND model NOT LIKE '%PHEV%'
  )
  OR (make = 'Ford' AND model LIKE '%Fiesta%' AND body = 'Hatchback');

-- Additional urban hatches and city cars
UPDATE cars SET segment = 'Urban'
WHERE make IN ('Mini','MINI','Fiat','Citroen')
  AND body IN ('Hatchback','Convertible','Wagon','Estate');

-- Family movers: MPVs, estates, and mainstream SUVs
UPDATE cars SET segment = 'Family'
WHERE (
    make IN ('Ford','Vauxhall','Renault','Citroen','Peugeot') AND body IN ('MPV','Wagon','Estate','Fastback','Camper')
  )
  OR (
    body LIKE 'SUV%' AND make IN ('Toyota','Honda','Nissan','Mazda','Kia','Hyundai','Skoda','Volkswagen','VW','Seat','SEAT','Cupra')
    AND model NOT LIKE '%Coupe%'
  )
  OR (body IN ('SUV','MPV','Wagon','Estate') AND model LIKE '%Tourneo%');

-- Off-road and adventure focused
UPDATE cars SET segment = 'Adventure'
WHERE make IN ('Land Rover','Range Rover','Jeep','Toyota','Isuzu','Mitsubishi','Suzuki')
  AND (
    model LIKE '%Defender%' OR model LIKE '%Wrangler%' OR model LIKE '%Discovery%' OR model LIKE '%Range Rover%' OR
    model LIKE '%Land Cruiser%' OR model LIKE '%Jimny%' OR model LIKE '%Outlander%' OR model LIKE '%D-Max%' OR
    model LIKE '%Korando%' OR model LIKE '%Rexton%' OR model LIKE '%Musso%' OR model LIKE '%Hilux%' OR model LIKE '%Navara%' OR model LIKE '%Trail%'
  );

-- Executive: premium saloons/estates and business SUVs
UPDATE cars SET segment = 'Executive'
WHERE make IN ('BMW','Mercedes-Benz','Audi','Volvo','Skoda','Peugeot','Renault','Citroen','DS','DS Automobiles')
  AND (
    body IN ('Saloon','Estate','Fastback') OR (
      body LIKE 'SUV%' AND (
        model LIKE '%A4%' OR model LIKE '%A6%' OR model LIKE '%C-Class%' OR model LIKE '%E-Class%' OR model LIKE '%S-Class%' OR
        model LIKE '%S90%' OR model LIKE '%V60%' OR model LIKE '%V90%' OR model LIKE '%3 Series%' OR model LIKE '%5 Series%' OR
        model LIKE '%Octavia%' OR model LIKE '%Superb%' OR model LIKE '%XC60%' OR model LIKE '%408%' OR model LIKE '%3008%' OR model LIKE '%5008%'
      )
    )
  );

-- Luxury flagships
UPDATE cars SET segment = 'Luxury'
WHERE make IN ('Mercedes-Benz','BMW','Audi','Porsche','Jaguar','Range Rover','Land Rover','Lexus','Volvo')
  AND (
    model LIKE '%S-Class%' OR model LIKE '%7 Series%' OR model LIKE '%A8%' OR model LIKE '%S%' OR model LIKE '%XC90%' OR
    model LIKE '%Range Rover%' OR model LIKE '%LS%' OR model LIKE '%LC%' OR model LIKE '%EQS%' OR model LIKE '%Panamera%' OR model LIKE '%Cayenne%'
  );

-- Performance and sports models
UPDATE cars SET segment = 'Performance'
WHERE make IN ('Porsche','Ferrari','Lamborghini','Maserati','Jaguar','BMW','Mercedes-Benz','Audi','Cupra','Toyota')
  AND (
    body IN ('Coupe','Convertible','Roadster') OR model LIKE '%GT%' OR model LIKE '%AMG%' OR model LIKE '%M%' OR model LIKE '%911%' OR
    model LIKE '%F8%' OR model LIKE '%Hurac%' OR model LIKE '%Aventador%' OR model LIKE '%Ghibli%' OR model LIKE '%F-Type%' OR
    model LIKE '%Supra%' OR model LIKE '%GR %' OR model LIKE '%Type R%' OR model LIKE '%Cupra%'
  );

-- EV and plug-in hybrids default to Green if not already set
UPDATE cars SET segment = 'Green'
WHERE power IN ('EV','PHEV') AND segment IS NULL;

-- Vans and pickups
UPDATE cars SET segment = 'Utility'
WHERE body IN ('Van','Pickup','Camper') AND segment IS NULL;

-- Fallbacks to cover anything missed
UPDATE cars SET segment = 'Family'
WHERE segment IS NULL AND body IN ('SUV','MPV','Wagon','Estate','Crossover','SUV-Coupe');

UPDATE cars SET segment = 'Executive'
WHERE segment IS NULL AND body IN ('Saloon','Fastback') AND make NOT IN ('Tesla','Renault','Nissan','Kia','Hyundai','MG','BYD','ORA');

UPDATE cars SET segment = 'Urban'
WHERE segment IS NULL AND body IN ('Hatchback','Crossover') AND make IN ('Renault','Nissan','Hyundai','Kia','Vauxhall','Peugeot','Toyota','Ford','Volkswagen','VW','Seat','SEAT');

UPDATE cars SET segment = 'Economy'
WHERE segment IS NULL AND body IN ('Hatchback','Saloon','Crossover');

UPDATE cars SET segment = 'Green'
WHERE segment IS NULL AND power IN ('EV','PHEV');

-- Final safety net
UPDATE cars SET segment = 'Family'
WHERE segment IS NULL;
