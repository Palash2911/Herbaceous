import {
  AdminDeleteUserCommand,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import "dotenv/config";
import { cognitoClient } from "../src/config/aws.js";
import prisma from "../src/config/prisma.js";

const SYNTHETIC_DOMAIN = "@herbaceous.internal";

async function wipeDatabase() {
  await prisma.$transaction([
    prisma.toleranceEvent.deleteMany({}),
    prisma.advocacyRequest.deleteMany({}),

    prisma.calendarEvent.deleteMany({}),
    prisma.meetingLink.deleteMany({}),
    prisma.pauseRequest.deleteMany({}),
    prisma.weeklyLog.deleteMany({}),

    prisma.mentorship.deleteMany({}),
    prisma.mentorshipRequest.deleteMany({}),

    prisma.credential.deleteMany({}),
    prisma.helpTicket.deleteMany({}),
    prisma.menteeProfile.deleteMany({}),
    prisma.mentorProfile.deleteMany({}),
    prisma.user.deleteMany({}),
  ]);

  console.log("Database wiped. PipelineStatistic left intact.");
}

async function wipeCognito() {
  const userPoolId = process.env.COGNITO_USER_POOL_ID;
  if (!userPoolId) {
    console.log("COGNITO_USER_POOL_ID not set, skipping Cognito wipe.");
    return;
  }

  let paginationToken;
  let deleted = 0;
  let skipped = 0;

  do {
    const page = await cognitoClient.send(
      new ListUsersCommand({
        UserPoolId: userPoolId,
        Limit: 60,
        PaginationToken: paginationToken,
      }),
    );

    for (const user of page.Users ?? []) {
      const username = user.Username;
      const email = user.Attributes?.find((a) => a.Name === "email")?.Value;

      const isSynthetic =
        username?.endsWith(SYNTHETIC_DOMAIN) ||
        email?.endsWith(SYNTHETIC_DOMAIN);

      if (!isSynthetic) {
        skipped += 1;
        continue;
      }

      await cognitoClient.send(
        new AdminDeleteUserCommand({
          UserPoolId: userPoolId,
          Username: username,
        }),
      );
      deleted += 1;
    }

    paginationToken = page.PaginationToken;
  } while (paginationToken);

  console.log(
    `Cognito wiped. Deleted ${deleted} synthetic accounts, skipped ${skipped} others.`,
  );
}

async function wipe() {
  const skipCognito = process.argv.includes("--db-only");

  await wipeDatabase();

  if (skipCognito) {
    console.log("Skipped Cognito wipe (--db-only).");
    return;
  }

  await wipeCognito();
}

wipe()
  .catch((err) => {
    console.error("Wipe failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
