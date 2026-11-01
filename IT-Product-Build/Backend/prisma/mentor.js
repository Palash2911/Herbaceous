import "dotenv/config";

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

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const PASSWORD = process.env.DUMMY_PASSWORD || "Herbaceous#Dummy1";

const WEAK = process.argv.includes("--weak");
const EMAIL = WEAK
  ? "mentor900004@herbaceous.internal"
  : "mentor900003@herbaceous.internal";

const STRONG = {
  displayName: "Perfect Match",
  profile: {
    field: "swe",
    jobTitle: "Staff Software Engineer",
    company: "Canva",
    yearsExperience: 6,
    specialisms: ["Industry networking", "Interview prep", "Confidence"],
    bio: "Test mentor built to score 100 against the swe postgrad quiz answers. Not a real person.",
    isVerified: true,
    acceptingMentees: true,
    openAvailability: true,
    mentoringStyle: "structured",
    availabilityCadence: "weekly",
    availabilityTimes: ["wdmorning", "wdafternoon", "wdevening", "weekend"],
  },
};

const WEAK_MENTOR = {
  displayName: "Poor Match",
  profile: {
    field: "chem",
    jobTitle: "Research Chemist",
    company: "CSIRO",
    yearsExperience: 22,
    specialisms: ["Structural biology"],
    bio: "Test mentor built to score low. Not a real person.",
    isVerified: false,
    acceptingMentees: true,
    openAvailability: true,
    mentoringStyle: "bigpicture",
    availabilityCadence: "monthly",
    availabilityTimes: [],
  },
};

const SPEC = WEAK ? WEAK_MENTOR : STRONG;

async function removeExisting() {
  const user = await prisma.user.findUnique({
    where: { syntheticEmail: EMAIL },
    include: { mentorProfile: true },
  });
  if (!user) return false;

  if (user.mentorProfile) {
    const profileId = user.mentorProfile.id;
    await prisma.mentorshipRequest.deleteMany({
      where: { mentorProfileId: profileId },
    });
    await prisma.credential.deleteMany({
      where: { mentorProfileId: profileId },
    });
    await prisma.mentorProfile.delete({ where: { id: profileId } });
  }
  await prisma.helpTicket.deleteMany({ where: { userId: user.id } });
  await prisma.user.delete({ where: { id: user.id } });
  return true;
}

async function main() {
  if (!USER_POOL_ID) throw new Error("COGNITO_USER_POOL_ID is not set.");

  await removeExisting();

  try {
    await cognitoClient.send(
      new AdminDeleteUserCommand({ UserPoolId: USER_POOL_ID, Username: EMAIL }),
    );
  } catch (err) {
    if (err.name !== "UserNotFoundException") throw err;
  }

  const created = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: EMAIL,
      MessageAction: "SUPPRESS",
      UserAttributes: [
        { Name: "email", Value: EMAIL },
        { Name: "email_verified", Value: "true" },
      ],
    }),
  );

  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: EMAIL,
      Password: PASSWORD,
      Permanent: true,
    }),
  );

  const cognitoUid = created.User?.Attributes?.find(
    (a) => a.Name === "sub",
  )?.Value;

  await prisma.user.create({
    data: {
      cognitoUid,
      syntheticEmail: EMAIL,
      displayName: SPEC.displayName,
      role: "MENTOR",
      mentorProfile: { create: SPEC.profile },
    },
  });

  console.log(`\nCreated ${SPEC.displayName}`);
  console.log(`  ${EMAIL}`);
  console.log(`  password ${PASSWORD}\n`);
  console.log(
    WEAK
      ? "  Expect a low score on the Matching screen.\n"
      : "  Expect 100 against a swe / postgrad / structured / weekly mentee\n" +
          "  with goals network, applications, confidence.\n",
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
