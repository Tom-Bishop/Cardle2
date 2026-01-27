-- Migration 014: Standardize origin by brand headquarters only
-- Ensures all cars of the same make have consistent origin based on brand HQ

-- Americas
UPDATE cars SET origin = 'USA' WHERE make IN ('Ford','Jeep','Dodge','Ram','Tesla','Cadillac','Chevrolet','GMC','Lincoln');

-- Germany
UPDATE cars SET origin = 'GER' WHERE make IN ('BMW','Mercedes-Benz','Audi','Porsche','Volkswagen','VW','Opel');

-- Czech Republic
UPDATE cars SET origin = 'CZE' WHERE make IN ('Skoda','Škoda');

-- France
UPDATE cars SET origin = 'FRA' WHERE make IN ('Peugeot','Citroen','Citroën','DS','Renault','DS Automobiles');

-- United Kingdom
UPDATE cars SET origin = 'GBR' WHERE make IN ('Vauxhall','Land Rover','Range Rover','Jaguar','Mini','MINI','Lotus');

-- Italy
UPDATE cars SET origin = 'ITA' WHERE make IN ('Fiat','Alfa Romeo','Ferrari','Lamborghini','Maserati','Lancia');

-- Spain
UPDATE cars SET origin = 'ESP' WHERE make IN ('SEAT','Seat','Cupra');

-- Romania
UPDATE cars SET origin = 'ROM' WHERE make IN ('Dacia');

-- Sweden
UPDATE cars SET origin = 'SWE' WHERE make IN ('Volvo','Polestar');

-- Japan
UPDATE cars SET origin = 'JPN' WHERE make IN ('Toyota','Lexus','Honda','Acura','Nissan','Infiniti','Mazda','Subaru','Mitsubishi','Suzuki','Isuzu','Daihatsu');

-- South Korea
UPDATE cars SET origin = 'KOR' WHERE make IN ('Hyundai','Kia','Genesis','SsangYong','Ssangyong');

-- China
UPDATE cars SET origin = 'CHN' WHERE make IN ('BYD','ORA','MG','Great Wall','GWM','GAC','Li Auto','XPeng','NIO');

-- Poland
UPDATE cars SET origin = 'POL' WHERE make IN ('FSO');

-- India
UPDATE cars SET origin = 'IND' WHERE make IN ('Tata','Mahindra','Maruti');

