# Railway Migration Failure Fix Guide

## Problem
The migration `20251108000000_convert_custom_domain_to_array` failed on Railway at 2025-11-09 21:44:47 UTC and is blocking all subsequent deployments with Prisma error **P3009**.

## Root Cause
The migration likely started executing but didn't complete successfully, leaving it in a "failed" state in the `_prisma_migrations` table. Prisma refuses to run new migrations when there are failed migrations present.

## Solution Options

### Option 1: Delete Failed Migration Record (Recommended)
This allows Prisma to re-run the migration cleanly.

**Steps:**
1. Connect to Railway PostgreSQL database:
   ```bash
   # Via Railway CLI
   railway connect postgres

   # Or via Railway dashboard: Database > Connect > PostgreSQL
   ```

2. Run the reset script:
   ```sql
   -- Copy contents from .railway/reset_failed_migration.sql
   DELETE FROM "_prisma_migrations"
   WHERE migration_name = '20251108000000_convert_custom_domain_to_array';
   ```

3. Verify deletion:
   ```sql
   SELECT migration_name, finished_at, rolled_back_at
   FROM "_prisma_migrations"
   ORDER BY finished_at DESC
   LIMIT 10;
   ```

4. Trigger new deployment on Railway (or wait for auto-deploy)

### Option 2: Mark as Rolled Back and Manually Fix Schema
This approach manually completes the migration and marks it as rolled back.

**Steps:**
1. Connect to Railway PostgreSQL database

2. Run the comprehensive fix script:
   ```sql
   -- Copy entire contents from .railway/fix_migration.sql
   -- This will:
   -- 1. Mark migration as rolled back
   -- 2. Create customDomains column if missing
   -- 3. Migrate data from customDomain if it exists
   -- 4. Drop old customDomain column
   ```

3. Trigger new deployment on Railway

### Option 3: Manual Schema Inspection (If Options 1-2 Fail)
If the above options don't work, manually inspect and fix the schema.

**Inspection queries:**
```sql
-- Check current Resume table columns
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Resume'
  AND column_name IN ('customDomain', 'customDomains')
ORDER BY column_name;

-- Check migration status
SELECT migration_name, finished_at, rolled_back_at,
       CASE
         WHEN rolled_back_at IS NOT NULL THEN 'ROLLED BACK'
         WHEN finished_at IS NOT NULL THEN 'COMPLETED'
         ELSE 'IN PROGRESS/FAILED'
       END as status
FROM "_prisma_migrations"
WHERE migration_name LIKE '%custom_domain%'
ORDER BY started_at DESC;

-- Check for remaining index
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'Resume'
  AND indexname LIKE '%customDomain%';
```

**Manual fix based on inspection:**
```sql
-- Scenario A: Both columns exist
-- Drop unique index, migrate data, drop old column
DROP INDEX IF EXISTS "Resume_customDomain_key";
UPDATE "Resume" SET "customDomains" = ARRAY["customDomain"]::TEXT[] WHERE "customDomain" IS NOT NULL;
ALTER TABLE "Resume" DROP COLUMN "customDomain";

-- Scenario B: Only customDomain exists
-- Run the full migration manually
ALTER TABLE "Resume" ADD COLUMN "customDomains" TEXT[] DEFAULT '{}';
UPDATE "Resume" SET "customDomains" = ARRAY["customDomain"]::TEXT[] WHERE "customDomain" IS NOT NULL;
DROP INDEX "Resume_customDomain_key";
ALTER TABLE "Resume" DROP COLUMN "customDomain";

-- Scenario C: Only customDomains exists (migration completed)
-- Just delete the failed migration record
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251108000000_convert_custom_domain_to_array';
```

## Railway CLI Commands

```bash
# Install Railway CLI (if not installed)
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Connect to PostgreSQL
railway connect postgres

# Or run SQL directly
railway run psql $DATABASE_URL -f .railway/reset_failed_migration.sql
```

## Verification After Fix

1. Check deployment logs for successful migration
2. Look for: `7 migrations found in prisma/migrations` followed by successful deployment
3. Verify in Railway database:
   ```sql
   -- Should show customDomains column, no customDomain column
   SELECT column_name FROM information_schema.columns WHERE table_name = 'Resume';

   -- Should show migration as completed
   SELECT * FROM "_prisma_migrations" WHERE migration_name = '20251108000000_convert_custom_domain_to_array';
   ```

## Expected Result

After successful fix:
- Migration `20251108000000_convert_custom_domain_to_array` will either:
  - Be deleted from `_prisma_migrations` (Option 1) and re-run successfully on next deploy
  - Be marked as rolled back and completed manually (Option 2)
- `Resume` table will have `customDomains TEXT[]` column
- `Resume` table will NOT have `customDomain` column
- No `Resume_customDomain_key` unique index
- Deployments will succeed

## Prevention

This migration failed likely due to:
1. PostgreSQL case-sensitivity with quoted identifiers
2. Timing/connection issues during deployment
3. Data inconsistency

Future migrations should include error handling and idempotency checks.