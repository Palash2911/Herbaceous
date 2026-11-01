-- Backfill existing NULL specialisms to empty array before the default is set,
-- otherwise the default only applies to rows inserted after this migration.
UPDATE "MentorProfile" SET "specialisms" = ARRAY[]::TEXT[] WHERE "specialisms" IS NULL;

-- AlterTable
ALTER TABLE "MentorProfile" ALTER COLUMN "specialisms" SET DEFAULT ARRAY[]::TEXT[];
