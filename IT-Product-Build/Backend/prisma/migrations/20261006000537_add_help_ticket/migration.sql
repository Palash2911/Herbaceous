-- CreateEnum
CREATE TYPE "HelpTicketCategory" AS ENUM ('CONDUCT', 'SAFETY', 'TECHNICAL', 'OTHER');

-- CreateEnum
CREATE TYPE "HelpTicketStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED');

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
CREATE INDEX "HelpTicket_userId_idx" ON "HelpTicket"("userId");

-- CreateIndex
CREATE INDEX "HelpTicket_status_createdAt_idx" ON "HelpTicket"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "HelpTicket" ADD CONSTRAINT "HelpTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
