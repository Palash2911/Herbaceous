/*
  Warnings:

  - You are about to drop the column `detail` on the `AdvocacyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `outcomeNote` on the `AdvocacyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `template` on the `AdvocacyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `AdvocacyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `videoLink` on the `CalendarEvent` table. All the data in the column will be lost.
  - You are about to drop the column `advocacyEnabled` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `advocacyEnabledAt` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `advocacyEnabledById` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `advocacyNote` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `expectedDuration` on the `PauseRequest` table. All the data in the column will be lost.
  - You are about to drop the column `requestedBy` on the `PauseRequest` table. All the data in the column will be lost.
  - The `status` column on the `PauseRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `loggedAt` on the `WeeklyLog` table. All the data in the column will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `type` to the `AdvocacyRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `AdvocacyRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdById` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CalendarEvent` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requestedById` to the `PauseRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `WeeklyLog` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PauseRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CalendarEventStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdvocacyType" AS ENUM ('REFERRAL', 'INTRODUCTION', 'NOMINATION', 'ENDORSEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "ToleranceCategory" AS ENUM ('MISSED_COMMITMENTS', 'UNRESPONSIVE', 'PLAN_NOT_FOLLOWED', 'CONDUCT_CONCERN', 'OTHER');

-- AlterEnum
ALTER TYPE "AdvocacyStatus" ADD VALUE 'WITHDRAWN';

-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'WITHDRAWN';

-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_createdBy_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_mentorshipId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "AdvocacyRequest" DROP COLUMN "detail",
DROP COLUMN "outcomeNote",
DROP COLUMN "template",
DROP COLUMN "title",
ADD COLUMN     "details" TEXT,
ADD COLUMN     "mentorNote" TEXT,
ADD COLUMN     "type" "AdvocacyType" NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "createdBy",
DROP COLUMN "videoLink",
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "meetingLinkId" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "status" "CalendarEventStatus" NOT NULL DEFAULT 'SCHEDULED',
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "startsAt" DROP NOT NULL;

-- AlterTable
ALTER TABLE "MenteeProfile" ADD COLUMN     "goals" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "MentorProfile" ADD COLUMN     "availabilityCadence" TEXT,
ADD COLUMN     "availabilityTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "mentoringStyle" TEXT;

-- AlterTable
ALTER TABLE "Mentorship" DROP COLUMN "advocacyEnabled",
DROP COLUMN "advocacyEnabledAt",
DROP COLUMN "advocacyEnabledById",
DROP COLUMN "advocacyNote",
ADD COLUMN     "chatRoomUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "chatRoomUpdatedById" TEXT,
ADD COLUMN     "chatRoomUrl" TEXT;

-- AlterTable
ALTER TABLE "PauseRequest" DROP COLUMN "expectedDuration",
DROP COLUMN "requestedBy",
ADD COLUMN     "expectedWeeks" INTEGER,
ADD COLUMN     "requestedById" TEXT NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "PauseRequestStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "WeeklyLog" DROP COLUMN "loggedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Message";

-- DropEnum
DROP TYPE "AdvocacyTemplate";

-- DropEnum
DROP TYPE "CheckInRequestStatus";

-- CreateTable
CREATE TABLE "MeetingLink" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "label" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeetingLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ToleranceEvent" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "category" "ToleranceCategory" NOT NULL,
    "reason" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ToleranceEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeetingLink_mentorshipId_idx" ON "MeetingLink"("mentorshipId");

-- CreateIndex
CREATE INDEX "ToleranceEvent_mentorshipId_idx" ON "ToleranceEvent"("mentorshipId");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_mentorshipId_idx" ON "AdvocacyRequest"("mentorshipId");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_mentorshipId_status_idx" ON "AdvocacyRequest"("mentorshipId", "status");

-- CreateIndex
CREATE INDEX "CalendarEvent_mentorshipId_idx" ON "CalendarEvent"("mentorshipId");

-- CreateIndex
CREATE INDEX "CalendarEvent_mentorshipId_status_idx" ON "CalendarEvent"("mentorshipId", "status");

-- CreateIndex
CREATE INDEX "PauseRequest_mentorshipId_idx" ON "PauseRequest"("mentorshipId");

-- CreateIndex
CREATE INDEX "PauseRequest_mentorshipId_status_idx" ON "PauseRequest"("mentorshipId", "status");

-- CreateIndex
CREATE INDEX "WeeklyLog_mentorshipId_idx" ON "WeeklyLog"("mentorshipId");

-- CreateIndex
CREATE INDEX "WeeklyLog_mentorshipId_status_idx" ON "WeeklyLog"("mentorshipId", "status");

-- AddForeignKey
ALTER TABLE "MeetingLink" ADD CONSTRAINT "MeetingLink_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_meetingLinkId_fkey" FOREIGN KEY ("meetingLinkId") REFERENCES "MeetingLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToleranceEvent" ADD CONSTRAINT "ToleranceEvent_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
