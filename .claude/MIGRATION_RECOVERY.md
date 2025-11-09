# Migration Recovery Guide - Multiple Custom Domains Feature

## Issue Summary

**Migration**: `20251108000000_convert_custom_domain_to_array`
**Status**: Failed on Railway production deployment (2025-11-09 21:44:47 UTC)
**Error**: `ERROR: column "customdomain" does not exist` (PostgreSQL code 42703)

**Root Cause**: PostgreSQL is case-sensitive when referencing column names without quotes. The migration SQL used `customDomain` (unquoted) which PostgreSQL interpreted as `customdomain` (lowercase), but the actual column name is `customDomain` with proper casing.

## What Happened

1. Migration started executing on production database
2. Step 1 succeeded: Added new `customDomains TEXT[]` column
3. Step 2 failed: `UPDATE` statement couldn't find `customDomain` column because it wasn't properly quoted
4. Prisma marked migration as failed, blocking all subsequent deploys

## Current Database State

Based on the partial migration execution:

- ✅ `customDomains TEXT[]` column exists (Step 1 completed)
- ✅ `customDomain String?` column still exists (Step 4 never executed)
- ✅ `Resume_customDomain_key` unique index still exists (Step 3 never executed)
- ❌ No data migrated from `customDomain` → `customDomains` (Step 2 failed)

## Fix Applied (Commit fc1c62b0)

**File**: `tools/prisma/migrations/20251108000000_convert_custom_domain_to_array/migration.sql`

**Change**: Line 7 - Added quotes around column reference
```sql
# Before (INCORRECT - causes case-sensitivity issue):
SET "customDomains" = ARRAY[customDomain]::TEXT[]

# After (CORRECT - properly quoted):
SET "customDomains" = ARRAY["customDomain"]::TEXT[]
```

## Recovery Steps for Railway Production

### Option 1: Manual Migration Resolution (RECOMMENDED)

Since the migration partially completed, we need to:

1. **Connect to Railway PostgreSQL database** (use Railway CLI or dashboard)

2. **Check current state**:
```sql
-- Verify both columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Resume'
  AND column_name IN ('customDomain', 'customDomains');

-- Check if any data exists in customDomain
SELECT COUNT(*) FROM "Resume" WHERE "customDomain" IS NOT NULL;
```

3. **Complete the migration manually**:
```sql
-- Step 2: Migrate data (the step that failed)
UPDATE "Resume"
SET "customDomains" = ARRAY["customDomain"]::TEXT[]
WHERE "customDomain" IS NOT NULL;

-- Verify data migration
SELECT
  "customDomain",
  "customDomains"
FROM "Resume"
WHERE "customDomain" IS NOT NULL
LIMIT 5;

-- Step 3: Drop unique index
DROP INDEX IF EXISTS "Resume_customDomain_key";

-- Step 4: Drop old column
ALTER TABLE "Resume" DROP COLUMN "customDomain";
```

4. **Mark migration as resolved in Prisma**:
```bash
# From Railway CLI or service shell
pnpm exec prisma migrate resolve --applied 20251108000000_convert_custom_domain_to_array
```

5. **Redeploy the application** (should now start successfully)

### Option 2: Rollback Migration (ALTERNATIVE)

If you prefer to rollback and retry:

1. **Rollback the partial migration**:
```sql
-- Drop the new column
ALTER TABLE "Resume" DROP COLUMN IF EXISTS "customDomains";

-- Verify old column still exists
SELECT column_name FROM information_schema.columns
WHERE table_name = 'Resume' AND column_name = 'customDomain';
```

2. **Mark migration as rolled back**:
```bash
pnpm exec prisma migrate resolve --rolled-back 20251108000000_convert_custom_domain_to_array
```

3. **Redeploy** (migration will re-run with fixed SQL)

## Verification Steps

After recovery, verify the migration completed successfully:

```sql
-- Check schema
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'Resume'
  AND column_name LIKE 'custom%';

-- Should show only:
-- customDomains | ARRAY

-- Check data migration
SELECT
  id,
  "customDomains"
FROM "Resume"
WHERE array_length("customDomains", 1) > 0
LIMIT 5;

-- Verify uniqueness constraint is gone
SELECT indexname FROM pg_indexes
WHERE tablename = 'Resume'
  AND indexname LIKE '%customDomain%';

-- Should return no results
```

## Prevention for Future

**Lesson Learned**: Always quote column names in PostgreSQL migrations, especially when:
- Column names use mixed case (camelCase, PascalCase)
- Referencing columns in UPDATE/SELECT statements
- Working with Prisma-generated schemas (uses camelCase by default)

**Best Practice**:
```sql
-- ALWAYS DO THIS:
UPDATE "Resume" SET "newColumn" = "oldColumn"

-- NEVER DO THIS:
UPDATE "Resume" SET "newColumn" = oldColumn
```

## Testing the Fix Locally

Before deploying to production:

```bash
# 1. Reset local database to pre-migration state
pnpm exec prisma migrate reset

# 2. Run migrations including the fixed one
pnpm exec prisma migrate deploy

# 3. Verify success
pnpm exec prisma migrate status
```

## Related Files

- Migration SQL: `tools/prisma/migrations/20251108000000_convert_custom_domain_to_array/migration.sql`
- Schema: `tools/prisma/schema.prisma` (line 60: `customDomains String[] @default([])`)
- Fix Commit: `fc1c62b0` - Feat: Support multiple custom domains per resume (up to 5)

## Support Resources

- Prisma Migration Troubleshooting: https://pris.ly/d/migrate-resolve
- PostgreSQL Identifier Quoting: https://www.postgresql.org/docs/current/sql-syntax-lexical.html#SQL-SYNTAX-IDENTIFIERS
- Railway Database Access: https://docs.railway.app/databases/postgresql
