-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'CLOSED';

-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "matchScore" INTEGER;
