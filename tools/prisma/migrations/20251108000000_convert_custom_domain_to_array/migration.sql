-- AlterTable: Convert customDomain to customDomains array
-- Step 1: Add new customDomains array column
ALTER TABLE "Resume" ADD COLUMN "customDomains" TEXT[] DEFAULT '{}';

-- Step 2: Migrate existing single domains to array (preserve data)
UPDATE "Resume"
SET "customDomains" = ARRAY["customDomain"]::TEXT[]
WHERE "customDomain" IS NOT NULL;

-- Step 3: Drop unique index
DROP INDEX "Resume_customDomain_key";

-- Step 4: Drop old column
ALTER TABLE "Resume" DROP COLUMN "customDomain";
