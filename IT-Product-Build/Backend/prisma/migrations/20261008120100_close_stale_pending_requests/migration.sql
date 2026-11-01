UPDATE "MentorshipRequest" AS r
SET "status" = 'CLOSED',
    "respondedAt" = now(),
    "updatedAt" = now()
WHERE r."status" = 'PENDING'
  AND EXISTS (
    SELECT 1
    FROM "Mentorship" AS m
    WHERE m."menteeProfileId" = r."menteeProfileId"
      AND m."status" IN ('ACTIVE', 'PAUSED')
  );
