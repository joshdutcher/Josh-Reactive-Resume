-- Reset failed migration by deleting it from _prisma_migrations table
-- This allows Prisma to re-run the migration on next deployment

-- Delete the failed migration record
DELETE FROM "_prisma_migrations"
WHERE migration_name = '20251108000000_convert_custom_domain_to_array';

-- Verify deletion
SELECT
    migration_name,
    finished_at,
    rolled_back_at
FROM "_prisma_migrations"
ORDER BY finished_at DESC
LIMIT 10;
