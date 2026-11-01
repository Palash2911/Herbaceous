-- AlterTable
ALTER TABLE "Credential" ADD COLUMN     "extractedFields" JSONB,
ALTER COLUMN "documentUrl" DROP NOT NULL;
