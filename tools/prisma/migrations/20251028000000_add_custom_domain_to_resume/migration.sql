-- AlterTable
ALTER TABLE "Resume" ADD COLUMN "customDomain" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Resume_customDomain_key" ON "Resume"("customDomain");
