-- Migration 009: Renumber cars to start from ID 1
-- SKIPPED: Cannot safely run on production (would break foreign key references)
SELECT 'Migration 009 skipped - car IDs already established' AS notice;
