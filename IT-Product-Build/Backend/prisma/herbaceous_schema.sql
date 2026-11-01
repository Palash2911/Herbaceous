-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MENTEE', 'MENTOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "CredentialStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'WITHDRAWN', 'CLOSED');

-- CreateEnum
CREATE TYPE "MentorshipStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- CreateEnum
CREATE TYPE "LogStatus" AS ENUM ('DONE', 'SKIPPED');

-- CreateEnum
CREATE TYPE "PauseType" AS ENUM ('PAUSE', 'RESUME');

-- CreateEnum
CREATE TYPE "PauseRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED', 'WITHDRAWN', 'CLOSED');

-- CreateEnum
CREATE TYPE "CalendarType" AS ENUM ('MEETING', 'REMINDER', 'NOTE');

-- CreateEnum
CREATE TYPE "CalendarEventStatus" AS ENUM ('SCHEDULED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdvocacyType" AS ENUM ('REFERRAL', 'INTRODUCTION', 'NOMINATION', 'ENDORSEMENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AdvocacyStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'DONE', 'WITHDRAWN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ToleranceCategory" AS ENUM ('MISSED_COMMITMENTS', 'UNRESPONSIVE', 'PLAN_NOT_FOLLOWED', 'CONDUCT_CONCERN', 'OTHER');

-- CreateEnum
CREATE TYPE "HelpTicketCategory" AS ENUM ('CONDUCT', 'SAFETY', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "HelpTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

-- CreateTable
CREATE TABLE "PipelineStatistic" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "displaySuffix" TEXT,
    "detail" TEXT,
    "sourceLabel" TEXT,
    "sourceUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PipelineStatistic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "cognitoUid" TEXT NOT NULL,
    "syntheticEmail" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenteeProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" TEXT,
    "careerStage" TEXT,
    "mentoringStyle" TEXT,
    "availabilityCadence" TEXT,
    "availabilityTimes" TEXT[],
    "goals" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "about" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenteeProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "field" TEXT,
    "jobTitle" TEXT,
    "company" TEXT,
    "yearsExperience" INTEGER,
    "specialisms" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "bio" TEXT,
    "mentoringStyle" TEXT,
    "availabilityCadence" TEXT,
    "availabilityTimes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "acceptingMentees" BOOLEAN NOT NULL DEFAULT true,
    "openAvailability" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "extractedFields" JSONB,
    "status" "CredentialStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNote" TEXT,
    "consentedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MentorshipRequest" (
    "id" TEXT NOT NULL,
    "menteeProfileId" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "message" TEXT,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "responseNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MentorshipRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mentorship" (
    "id" TEXT NOT NULL,
    "menteeProfileId" TEXT NOT NULL,
    "mentorProfileId" TEXT NOT NULL,
    "requestId" TEXT,
    "status" "MentorshipStatus" NOT NULL DEFAULT 'ACTIVE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "endReason" TEXT,
    "endedById" TEXT,
    "matchScore" INTEGER,
    "chatRoomUrl" TEXT,
    "chatRoomUpdatedById" TEXT,
    "chatRoomUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mentorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WeeklyLog" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "status" "LogStatus" NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeeklyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PauseRequest" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "type" "PauseType" NOT NULL,
    "reason" TEXT NOT NULL,
    "expectedWeeks" INTEGER,
    "status" "PauseRequestStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "responseNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PauseRequest_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "type" "CalendarType" NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "startsAt" TIMESTAMP(3),
    "meetingLinkId" TEXT,
    "status" "CalendarEventStatus" NOT NULL DEFAULT 'SCHEDULED',
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvocacyRequest" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "type" "AdvocacyType" NOT NULL,
    "details" TEXT,
    "status" "AdvocacyStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "mentorNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdvocacyRequest_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "HelpTicket" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "category" "HelpTicketCategory" NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "status" "HelpTicketStatus" NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HelpTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PipelineStatistic_key_key" ON "PipelineStatistic"("key");

-- CreateIndex
CREATE UNIQUE INDEX "User_cognitoUid_key" ON "User"("cognitoUid");

-- CreateIndex
CREATE UNIQUE INDEX "User_syntheticEmail_key" ON "User"("syntheticEmail");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "MenteeProfile_userId_key" ON "MenteeProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MentorProfile_userId_key" ON "MentorProfile"("userId");

-- CreateIndex
CREATE INDEX "MentorProfile_isVerified_idx" ON "MentorProfile"("isVerified");

-- CreateIndex
CREATE INDEX "MentorProfile_field_idx" ON "MentorProfile"("field");

-- CreateIndex
CREATE INDEX "Credential_mentorProfileId_idx" ON "Credential"("mentorProfileId");

-- CreateIndex
CREATE INDEX "Credential_status_idx" ON "Credential"("status");

-- CreateIndex
CREATE INDEX "MentorshipRequest_menteeProfileId_status_idx" ON "MentorshipRequest"("menteeProfileId", "status");

-- CreateIndex
CREATE INDEX "MentorshipRequest_mentorProfileId_status_idx" ON "MentorshipRequest"("mentorProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Mentorship_requestId_key" ON "Mentorship"("requestId");

-- CreateIndex
CREATE INDEX "Mentorship_menteeProfileId_status_idx" ON "Mentorship"("menteeProfileId", "status");

-- CreateIndex
CREATE INDEX "Mentorship_mentorProfileId_status_idx" ON "Mentorship"("mentorProfileId", "status");

-- CreateIndex
CREATE INDEX "WeeklyLog_mentorshipId_idx" ON "WeeklyLog"("mentorshipId");

-- CreateIndex
CREATE INDEX "WeeklyLog_mentorshipId_status_idx" ON "WeeklyLog"("mentorshipId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WeeklyLog_mentorshipId_weekNumber_key" ON "WeeklyLog"("mentorshipId", "weekNumber");

-- CreateIndex
CREATE INDEX "PauseRequest_mentorshipId_idx" ON "PauseRequest"("mentorshipId");

-- CreateIndex
CREATE INDEX "PauseRequest_mentorshipId_status_idx" ON "PauseRequest"("mentorshipId", "status");

-- CreateIndex
CREATE INDEX "MeetingLink_mentorshipId_idx" ON "MeetingLink"("mentorshipId");

-- CreateIndex
CREATE INDEX "CalendarEvent_mentorshipId_idx" ON "CalendarEvent"("mentorshipId");

-- CreateIndex
CREATE INDEX "CalendarEvent_mentorshipId_status_idx" ON "CalendarEvent"("mentorshipId", "status");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_mentorshipId_idx" ON "AdvocacyRequest"("mentorshipId");

-- CreateIndex
CREATE INDEX "AdvocacyRequest_mentorshipId_status_idx" ON "AdvocacyRequest"("mentorshipId", "status");

-- CreateIndex
CREATE INDEX "ToleranceEvent_mentorshipId_idx" ON "ToleranceEvent"("mentorshipId");

-- CreateIndex
CREATE INDEX "HelpTicket_userId_idx" ON "HelpTicket"("userId");

-- CreateIndex
CREATE INDEX "HelpTicket_status_createdAt_idx" ON "HelpTicket"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "MenteeProfile" ADD CONSTRAINT "MenteeProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorProfile" ADD CONSTRAINT "MentorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credential" ADD CONSTRAINT "Credential_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipRequest" ADD CONSTRAINT "MentorshipRequest_menteeProfileId_fkey" FOREIGN KEY ("menteeProfileId") REFERENCES "MenteeProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MentorshipRequest" ADD CONSTRAINT "MentorshipRequest_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_menteeProfileId_fkey" FOREIGN KEY ("menteeProfileId") REFERENCES "MenteeProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_mentorProfileId_fkey" FOREIGN KEY ("mentorProfileId") REFERENCES "MentorProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "MentorshipRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WeeklyLog" ADD CONSTRAINT "WeeklyLog_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PauseRequest" ADD CONSTRAINT "PauseRequest_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MeetingLink" ADD CONSTRAINT "MeetingLink_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_meetingLinkId_fkey" FOREIGN KEY ("meetingLinkId") REFERENCES "MeetingLink"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvocacyRequest" ADD CONSTRAINT "AdvocacyRequest_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ToleranceEvent" ADD CONSTRAINT "ToleranceEvent_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

