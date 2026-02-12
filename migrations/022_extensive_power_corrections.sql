-- Extensive corrections for iconic power types
-- Cars should reflect what they're most famous for, not just latest variants

-- BMW 330e and 530e are HYBRID ONLY models - but base 3/5 series are iconic as ICE
-- These should be ICE as the base car is more iconic
UPDATE cars SET power = 'ICE' WHERE make = 'BMW' AND model IN ('330e', '530e');

-- Mazda CX-60 is primarily known as PHEV/hybrid in UK market (correct as Hybrid)
-- But Mazda2 Hybrid is just rebadged Yaris - should be marked correctly
-- Already fixed

-- Porsche Panamera - iconic as ICE performance sedan, hybrid is secondary
UPDATE cars SET power = 'ICE' WHERE make = 'Porsche' AND model = 'Panamera';

-- VW Multivan - iconic as ICE people carrier, hybrid is new
UPDATE cars SET power = 'ICE' WHERE make = 'Volkswagen' AND model = 'Multivan';

-- Suzuki Across - this is just a rebadged RAV4 PHEV, not iconic
UPDATE cars SET power = 'ICE' WHERE make = 'Suzuki' AND model = 'Across';

-- Kia XCeed - iconic as ICE crossover
UPDATE cars SET power = 'ICE' WHERE make = 'Kia' AND model = 'XCeed';

-- Honda CR-V is iconically ICE SUV, PHEV version is very recent
UPDATE cars SET power = 'ICE' WHERE make = 'Honda' AND model = 'CR-V Plug-in Hybrid';

-- Lexus models - these ARE actually iconic as hybrids in modern era
-- Lexus has been hybrid-focused since 2000s, keep as Hybrid

-- Toyota models - Toyota hybrids are iconic (Prius started hybrid revolution)
-- Keep Toyota hybrids as Hybrid (Corolla, Yaris, RAV4, C-HR, Camry)

-- DS models with E-Tense suffix are hybrid variants, but DS brand not known for this
-- Keep base DS models as ICE, hybrids can stay as indicated

-- Audi/BMW/Mercedes hybrid variants with specific names (TFSI e, xDrive30e, 300 e)
-- These are clearly hybrid-specific variants, should stay Hybrid

-- Citroen C5 Aircross Hybrid - already set to ICE (correct)

-- Hyundai/Kia Hybrid variants - most are ICE-first brands
-- Kona Hybrid, Santa Fe Hybrid, Niro Hybrid, Sorento Hybrid should be ICE
UPDATE cars SET power = 'ICE' WHERE make = 'Hyundai' AND model IN ('Kona Hybrid', 'Santa Fe Hybrid');

-- All "Plug-in Hybrid" named cars are hybrid variants of ICE originals
-- Change to indicate the base car is ICE
UPDATE cars SET power = 'ICE' WHERE model LIKE '%Plug-in Hybrid%' AND make NOT IN ('Toyota', 'Lexus', 'Mitsubishi');

-- Mitsubishi Outlander PHEV is iconic AS a PHEV (one of first mass-market PHEVs)
-- Keep Mitsubishi PHEVs as Hybrid

-- All "e-HYBRID" Cupra/VW models are variants
UPDATE cars SET power = 'ICE' WHERE model LIKE '%e-HYBRID%';

-- All "4xe" Jeep models (Jeep's PHEV branding)
UPDATE cars SET power = 'ICE' WHERE model LIKE '%4xe%';

-- Land Rover PHEV variants
UPDATE cars SET power = 'ICE' WHERE make = 'Land Rover' AND model LIKE '%PHEV%';

-- Mercedes plug-in hybrids with model numbers (A 250 e, C 300 e, E 300 e, GLC 300 e, S 580 e)
UPDATE cars SET power = 'ICE' WHERE make = 'Mercedes-Benz' AND (model LIKE '%250 e%' OR model LIKE '%300 e%' OR model LIKE '%580 e%');

-- BMW xDrive hybrids (X3 xDrive30e, X5 xDrive50e)
UPDATE cars SET power = 'ICE' WHERE make = 'BMW' AND model LIKE '%xDrive%e%';

-- Audi TFSI e models
UPDATE cars SET power = 'ICE' WHERE make = 'Audi' AND model LIKE '%TFSI e%';
