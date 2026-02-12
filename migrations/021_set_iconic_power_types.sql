-- Set power types to the most iconic/recognized version of each car
-- This makes the game more playable as the power hint reflects what the car is famous for

-- Honda Civic is iconically ICE (especially Civic Type R heritage)
UPDATE cars SET power = 'ICE' WHERE make = 'Honda' AND model = 'Civic Hatchback';

-- Honda Jazz, HR-V, ZR-V are more iconic as regular cars, not hybrid-first
UPDATE cars SET power = 'ICE' WHERE make = 'Honda' AND model IN ('Jazz', 'HR-V', 'ZR-V');

-- Hyundai Kona is iconically an ICE crossover (EV version came later)
UPDATE cars SET power = 'ICE' WHERE make = 'Hyundai' AND model = 'Kona';

-- Hyundai Santa Fe is iconically ICE SUV
UPDATE cars SET power = 'ICE' WHERE make = 'Hyundai' AND model = 'Santa Fe';

-- Alfa Romeo Tonale is more known as regular SUV, not hybrid-first
UPDATE cars SET power = 'ICE' WHERE make = 'Alfa Romeo' AND model = 'Tonale';

-- Ford Kuga, Explorer - iconic as ICE SUVs
UPDATE cars SET power = 'ICE' WHERE make = 'Ford' AND model IN ('Kuga', 'Explorer');

-- Jeep Wrangler is iconically ICE (gas-guzzling off-roader)
UPDATE cars SET power = 'ICE' WHERE make = 'Jeep' AND model = 'Wrangler';

-- Citroen C5 Aircross is iconic as ICE
UPDATE cars SET power = 'ICE' WHERE make = 'Citroen' AND model = 'C5 Aircross Hybrid';

-- Lexus models - while they do hybrids well, some are more iconic for other reasons
-- Lexus IS is iconic as ICE sports sedan (already correct)
-- Lexus LC is iconic as hybrid grand tourer (keep as HYB)
-- Lexus ES, LS, NX, RX, UX are hybrid-first in modern era (keep as HYB)

-- Toyota models - Prius is iconic hybrid, but let's check others
-- Toyota Corolla, Yaris, RAV4, C-HR are strongly associated with hybrid now (keep HYB)
-- Toyota Camry, Highlander are hybrid-first in UK (keep HYB)

-- Kia/Hyundai hybrids - most are ICE-first
UPDATE cars SET power = 'ICE' WHERE make = 'Kia' AND model IN ('Niro Hybrid', 'Sorento Hybrid');

-- Mazda2 Hybrid is actually just rebadged Yaris
UPDATE cars SET power = 'ICE' WHERE make = 'Mazda' AND model = 'Mazda2 Hybrid';

-- DS 9 is actually hybrid-only, but DS is not known for hybrids
UPDATE cars SET power = 'ICE' WHERE make = 'DS Automobiles' AND model = 'DS 9';

-- Convert all MHEV to ICE (mild hybrid is still fundamentally ICE)
UPDATE cars SET power = 'ICE' WHERE power = 'MHEV';

-- Normalize HYB to Hybrid for consistency
UPDATE cars SET power = 'Hybrid' WHERE power = 'HYB';
