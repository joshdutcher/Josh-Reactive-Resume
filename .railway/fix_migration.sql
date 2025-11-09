-- Fix failed migration: 20251108000000_convert_custom_domain_to_array
-- This script resolves the P3009 error by marking the failed migration as rolled back
-- and manually completing the schema changes

-- Step 1: Mark the failed migration as rolled back
UPDATE "_prisma_migrations"
SET rolled_back_at = NOW()
WHERE migration_name = '20251108000000_convert_custom_domain_to_array'
  AND rolled_back_at IS NULL;

-- Step 2: Check current state and fix schema
-- Check if customDomains column exists
DO $$
BEGIN
    -- If customDomains doesn't exist, create it
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Resume' AND column_name = 'customDomains'
    ) THEN
        ALTER TABLE "Resume" ADD COLUMN "customDomains" TEXT[] DEFAULT '{}';
    END IF;

    -- If customDomain still exists, migrate data and drop it
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'Resume' AND column_name = 'customDomain'
    ) THEN
        -- Migrate existing data
        UPDATE "Resume"
        SET "customDomains" = ARRAY["customDomain"]::TEXT[]
        WHERE "customDomain" IS NOT NULL;

        -- Drop unique index if it exists
        IF EXISTS (
            SELECT 1 FROM pg_indexes
            WHERE tablename = 'Resume' AND indexname = 'Resume_customDomain_key'
        ) THEN
            DROP INDEX "Resume_customDomain_key";
        END IF;

        -- Drop old column
        ALTER TABLE "Resume" DROP COLUMN "customDomain";
    END IF;
END
$$;

-- Verify the fix
SELECT
    migration_name,
    finished_at,
    rolled_back_at,
    CASE
        WHEN rolled_back_at IS NOT NULL THEN 'ROLLED BACK'
        WHEN finished_at IS NOT NULL THEN 'COMPLETED'
        ELSE 'IN PROGRESS'
    END as status
FROM "_prisma_migrations"
WHERE migration_name = '20251108000000_convert_custom_domain_to_array';

-- Verify schema
SELECT
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'Resume'
  AND column_name IN ('customDomain', 'customDomains')
ORDER BY column_name;
