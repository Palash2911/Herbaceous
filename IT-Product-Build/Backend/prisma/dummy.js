import "dotenv/config";
import { randomInt } from "node:crypto";

import {
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import * as awsConfig from "../src/config/aws.js";
import * as prismaConfig from "../src/config/prisma.js";

const prisma = prismaConfig.prisma ?? prismaConfig.default;
const cognitoClient =
  awsConfig.cognitoClient ?? awsConfig.cognito ?? awsConfig.default;

if (!prisma)
  throw new Error(
    "Could not resolve the Prisma client from src/config/prisma.js",
  );
if (!cognitoClient)
  throw new Error(
    "Could not resolve the Cognito client from src/config/aws.js",
  );
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

const PASSWORD = process.env.DUMMY_PASSWORD || "Herbaceous#Dummy1";

const MENTEE_EMAIL = "mentee900001@herbaceous.internal";
const MENTOR_A_EMAIL = "mentor900001@herbaceous.internal";
const MENTOR_B_EMAIL = "mentor900002@herbaceous.internal";

const ALL_EMAILS = [MENTEE_EMAIL, MENTOR_A_EMAIL, MENTOR_B_EMAIL];

const MENTEE = {
  email: MENTEE_EMAIL,
  displayName: "Dummy Mentee",
  profile: {
    field: "data",
    careerStage: "postgrad",
    mentoringStyle: "handson",
    availabilityCadence: "weekly",
    availabilityTimes: ["wdmorning", "weekend"],
    goals: ["skills", "direction"],
    about: "Dummy account for local testing. Not a real person.",
  },
};

const MENTOR_A = {
  email: MENTOR_A_EMAIL,
  displayName: "Dummy Mentor A",
  profile: {
    field: "data",
    jobTitle: "Principal Data Scientist",
    company: "CSIRO",
    yearsExperience: 12,
    specialisms: ["ML systems", "Data strategy", "Engineering careers"],
    bio: "Dummy mentor built to be a strong match. Not a real person.",
    isVerified: true,
    acceptingMentees: true,
    openAvailability: true,
    mentoringStyle: "handson",
    availabilityCadence: "weekly",
    availabilityTimes: ["wdmorning", "weekend"],
  },
};

const MENTOR_B = {
  email: MENTOR_B_EMAIL,
  displayName: "Dummy Mentor B",
  profile: {
    field: "swe",
    jobTitle: "Head of Engineering",
    company: "Atlassian",
    yearsExperience: 9,
    specialisms: ["Leadership", "Interview prep"],
    bio: "Dummy mentor built to be a weak match. Not a real person.",
    isVerified: false,
    acceptingMentees: true,
    openAvailability: true,
    mentoringStyle: "bigpicture",
    availabilityCadence: "fortnightly",
    availabilityTimes: ["wdevening"],
  },
};

// --------------------------------------------------------------------------
// Arguments
// --------------------------------------------------------------------------

function readFlag(name, fallback) {
  const raw = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (!raw) return fallback;
  const value = Number.parseInt(raw.split("=")[1], 10);
  return Number.isFinite(value) ? value : fallback;
}

const CURRENT_WEEK = Math.max(1, readFlag("weeks", 4));
const LOG_COUNT = Math.max(0, readFlag("logs", 0));
const SKIP_MATCH = process.argv.includes("--no-match");

function startedAtForWeek(week) {
  const daysBack = (week - 1) * 7 + 3;
  const date = new Date();
  date.setDate(date.getDate() - daysBack);
  return date;
}

// --------------------------------------------------------------------------
// Cognito
// --------------------------------------------------------------------------

async function deleteCognitoUser(email) {
  try {
    await cognitoClient.send(
      new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: email }),
    );
    return true;
  } catch (err) {
    // Already gone is the expected case on a first run.
    if (err.name === "UserNotFoundException") return false;
    throw err;
  }
}

async function createCognitoUser(email) {
  const created = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      // No inbox exists on herbaceous.internal, so suppress the invite.
      MessageAction: "SUPPRESS",
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "email_verified", Value: "true" },
      ],
    }),
  );

  // Permanent so the account skips the FORCE_CHANGE_PASSWORD challenge and
  // you can log straight in without the new-password screen.
  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: PASSWORD,
      Permanent: true,
    }),
  );

  const sub = created.User?.Attributes?.find((a) => a.Name === "sub")?.Value;
  if (!sub) throw new Error(`Cognito returned no sub for ${email}`);
  return sub;
}

// --------------------------------------------------------------------------
// Cleanup
// --------------------------------------------------------------------------

/**
 * Removes the three dummy accounts and everything hanging off them, in
 * foreign-key-safe order. This is the one place in the codebase that does
 * hard deletes on purpose: these rows are disposable test fixtures, not
 * user data, and the no-hard-delete rule is about the application's own
 * behaviour rather than a dev seed script.
 */
async function removeDummyData() {
  const users = await prisma.user.findMany({
    where: { syntheticEmail: { in: ALL_EMAILS } },
    include: { menteeProfile: true, mentorProfile: true },
  });

  if (users.length === 0) return { users: 0 };

  const menteeProfileIds = users
    .map((u) => u.menteeProfile?.id)
    .filter(Boolean);
  const mentorProfileIds = users
    .map((u) => u.mentorProfile?.id)
    .filter(Boolean);
  const userIds = users.map((u) => u.id);

  const mentorships = await prisma.mentorship.findMany({
    where: {
      OR: [
        { menteeProfileId: { in: menteeProfileIds } },
        { mentorProfileId: { in: mentorProfileIds } },
      ],
    },
    select: { id: true },
  });
  const mentorshipIds = mentorships.map((m) => m.id);

  if (mentorshipIds.length > 0) {
    const scope = { where: { mentorshipId: { in: mentorshipIds } } };
    // Children first. There are no cascade deletes on mentorship children,
    // so each one has to go explicitly.
    await prisma.toleranceEvent.deleteMany(scope);
    await prisma.advocacyRequest.deleteMany(scope);
    await prisma.calendarEvent.deleteMany(scope);
    await prisma.meetingLink.deleteMany(scope);
    await prisma.pauseRequest.deleteMany(scope);
    await prisma.weeklyLog.deleteMany(scope);
    await prisma.mentorship.deleteMany({
      where: { id: { in: mentorshipIds } },
    });
  }

  await prisma.mentorshipRequest.deleteMany({
    where: {
      OR: [
        { menteeProfileId: { in: menteeProfileIds } },
        { mentorProfileId: { in: mentorProfileIds } },
      ],
    },
  });

  await prisma.credential.deleteMany({
    where: { mentorProfileId: { in: mentorProfileIds } },
  });

  // CalendarEvent also points at User as creator, but every row was scoped
  // to a dummy mentorship and removed above.
  await prisma.helpTicket.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.menteeProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.mentorProfile.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.user.deleteMany({ where: { id: { in: userIds } } });

  return { users: users.length, mentorships: mentorshipIds.length };
}

// --------------------------------------------------------------------------
// Creation
// --------------------------------------------------------------------------

async function createMentee(spec) {
  await deleteCognitoUser(spec.email);
  const cognitoUid = await createCognitoUser(spec.email);

  return prisma.user.create({
    data: {
      cognitoUid,
      syntheticEmail: spec.email,
      displayName: spec.displayName,
      role: "MENTEE",
      // field is set, so the route guard treats onboarding as complete and
      // sends you straight to /dashboard instead of /onboarding.
      menteeProfile: { create: spec.profile },
    },
    include: { menteeProfile: true },
  });
}

async function createMentor(spec) {
  await deleteCognitoUser(spec.email);
  const cognitoUid = await createCognitoUser(spec.email);

  return prisma.user.create({
    data: {
      cognitoUid,
      syntheticEmail: spec.email,
      displayName: spec.displayName,
      role: "MENTOR",
      mentorProfile: { create: spec.profile },
    },
    include: { mentorProfile: true },
  });
}

async function createMentorship(menteeProfileId, mentorProfileId) {
  const request = await prisma.mentorshipRequest.create({
    data: {
      menteeProfileId,
      mentorProfileId,
      status: "ACCEPTED",
    },
  });

  return prisma.mentorship.create({
    data: {
      menteeProfileId,
      mentorProfileId,
      requestId: request.id,
      status: "ACTIVE",
      startedAt: startedAtForWeek(CURRENT_WEEK),
    },
  });
}

async function createWeeklyLogs(mentorshipId, count) {
  if (count === 0) return 0;
  const weeks = Math.min(count, CURRENT_WEEK - 1);
  if (weeks <= 0) return 0;

  for (let week = 1; week <= weeks; week += 1) {
    await prisma.weeklyLog.create({
      data: {
        mentorshipId,
        weekNumber: week,
        status: "DONE",
        note: `Dummy log for week ${week}.`,
      },
    });
  }
  return weeks;
}

// --------------------------------------------------------------------------
// Main
// --------------------------------------------------------------------------

async function main() {
  if (!USER_POOL_ID) {
    throw new Error("COGNITO_USER_POOL_ID is not set. Check Backend/.env.");
  }

  console.log("Removing existing dummy accounts...");
  const removed = await removeDummyData();
  // Cognito is cleared per account inside the create functions, so a
  // Cognito user left behind by a half-failed run is still handled.
  if (removed.users > 0) {
    console.log(
      `  removed ${removed.users} user(s), ${removed.mentorships ?? 0} mentorship(s)`,
    );
  } else {
    console.log("  nothing to remove");
  }

  console.log("Creating accounts...");
  const mentee = await createMentee(MENTEE);
  const mentorA = await createMentor(MENTOR_A);
  const mentorB = await createMentor(MENTOR_B);

  let matched = null;
  let mentorship = null;
  let loggedWeeks = 0;

  if (!SKIP_MATCH) {
    const mentors = [mentorA, mentorB];
    matched = mentors[randomInt(0, mentors.length)];
    mentorship = await createMentorship(
      mentee.menteeProfile.id,
      matched.mentorProfile.id,
    );
    loggedWeeks = await createWeeklyLogs(mentorship.id, LOG_COUNT);
  }

  console.log("\nDone.\n");
  console.log(`Password for all accounts:  ${PASSWORD}\n`);
  console.log("  MENTEE   ", MENTEE_EMAIL);
  console.log(
    "  MENTOR A ",
    MENTOR_A_EMAIL,
    "(strong match, verified)",
    matched?.id === mentorA.id ? "  <-- MATCHED" : "",
  );
  console.log(
    "  MENTOR B ",
    MENTOR_B_EMAIL,
    "(weak match, unverified)",
    matched?.id === mentorB.id ? "  <-- MATCHED" : "",
  );

  if (mentorship) {
    console.log(`\n  mentorshipId  ${mentorship.id}`);
    console.log(`  startedAt     ${mentorship.startedAt.toISOString()}`);
    console.log(`  current week  ${CURRENT_WEEK}`);
    console.log(`  weekly logs   ${loggedWeeks}`);
  } else {
    console.log("\n  No mentorship created (--no-match).");
  }

  console.log(
    "\nOpen the mentee in a normal window and the matched mentor in incognito,\n" +
      "otherwise logging in as one signs the other out.\n",
  );
}

main()
  .catch((err) => {
    console.error("\nFailed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
