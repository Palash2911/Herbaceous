/*
  Warnings:

  - You are about to drop the column `bio` on the `MenteeProfile` table. All the data in the column will be lost.
  - You are about to drop the column `institution` on the `MenteeProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "MenteeProfile" DROP COLUMN "bio",
DROP COLUMN "institution",
ADD COLUMN     "about" TEXT,
ADD COLUMN     "availabilityCadence" TEXT,
ADD COLUMN     "availabilityTimes" TEXT[],
ADD COLUMN     "mentoringStyle" TEXT;
