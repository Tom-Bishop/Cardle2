-- Convert all PHEV cars to Hybrid

UPDATE cars SET power = 'Hybrid' WHERE power = 'PHEV';
