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
const WITH_HISTORY = process.argv.includes("--history");
const REMOVE_ONLY = process.argv.includes("--remove");

const email = (n) =>
  `mentor9100${String(n).padStart(2, "0")}@herbaceous.internal`;
const historyEmail = (n) =>
  `mentee9101${String(n).padStart(2, "0")}@herbaceous.internal`;

// [displayName, profile, pastMentees, advocacyDone]
const MENTORS = [
  [
    "Quiet Falcon",
    {
      field: "data",
      jobTitle: "Lead Data Scientist",
      company: "Australian health-tech scale-up",
      yearsExperience: 11,
      specialisms: ["ML systems", "Data strategy", "Engineering careers"],
      bio: "I build clinical risk models and lead a team of eight. I moved from academia into industry and love helping people make that same jump without losing their research edge.",
      isVerified: true,
      openAvailability: true,
      mentoringStyle: "handson",
      availabilityCadence: "weekly",
      availabilityTimes: ["wdmorning", "weekend"],
    },
    4,
    3,
  ],
  [
    "Bright Heron",
    {
      field: "swe",
      jobTitle: "Staff Software Engineer",
      company: "Melbourne fintech",
      yearsExperience: 14,
      specialisms: ["Leadership", "Interview prep", "Engineering careers"],
      bio: "Fourteen years writing payment systems. I have sat on more than 200 interview panels, so I know what hiring managers actually look for. Happy to run mock interviews.",
      isVerified: true,
      openAvailability: false,
      mentoringStyle: "structured",
      availabilityCadence: "fortnightly",
      availabilityTimes: ["wdevening"],
    },
    6,
    5,
  ],
  [
    "Steady Wren",
    {
      field: "data",
      jobTitle: "Analytics Manager",
      company: "Big Four bank",
      yearsExperience: 8,
      specialisms: ["Data strategy", "Leadership"],
      bio: "I lead an analytics team in retail banking. I was the first in my family to go to university, and I care a lot about making corporate career paths less mysterious.",
      isVerified: true,
      openAvailability: true,
      mentoringStyle: "structured",
      availabilityCadence: "weekly",
      availabilityTimes: ["wdevening", "weekend"],
    },
    3,
    2,
  ],
  [
    "Clever Otter",
    {
      field: "swe",
      jobTitle: "Senior Frontend Engineer",
      company: "Sydney SaaS company",
      yearsExperience: 6,
      specialisms: ["Interview prep", "Engineering careers"],
      bio: "I switched into software from graphic design at 27. If you are changing careers or doubting whether you belong in tech, I have been exactly where you are.",
      isVerified: false,
      openAvailability: true,
      mentoringStyle: "flexible",
      availabilityCadence: "weekly",
      availabilityTimes: ["wdevening"],
    },
    2,
    1,
  ],
  [
    "Gentle Kestrel",
    {
      field: "data",
      jobTitle: "Research Scientist",
      company: "National science agency",
      yearsExperience: 16,
      specialisms: ["ML systems", "Data strategy"],
      bio: "I work on climate and agricultural modelling. I supervise PhD students and enjoy helping early researchers publish, present and find funding.",
      isVerified: true,
      openAvailability: false,
      mentoringStyle: "bigpicture",
      availabilityCadence: "monthly",
      availabilityTimes: ["wdmorning"],
    },
    5,
    4,
  ],
  [
    "Swift Lark",
    {
      field: "swe",
      jobTitle: "Engineering Manager",
      company: "Global e-commerce company",
      yearsExperience: 12,
      specialisms: ["Leadership", "Engineering careers"],
      bio: "I manage two platform teams and recently made the jump from senior engineer to manager. Ask me anything about promotion cases and getting noticed for the right work.",
      isVerified: true,
      openAvailability: true,
      mentoringStyle: "structured",
      availabilityCadence: "fortnightly",
      availabilityTimes: ["wdmorning", "wdevening"],
    },
    7,
    6,
  ],
  [
    "Calm Ibis",
    {
      field: "data",
      jobTitle: "Machine Learning Engineer",
      company: "Brisbane AI startup",
      yearsExperience: 4,
      specialisms: ["ML systems", "Interview prep"],
      bio: "I graduated four years ago, so the early-career job hunt is still fresh. I can help with portfolios, take-home tasks and your first ML role.",
      isVerified: false,
      openAvailability: true,
      mentoringStyle: "handson",
      availabilityCadence: "weekly",
      availabilityTimes: ["weekend"],
    },
    1,
    0,
  ],
  [
    "Bold Magpie",
    {
      field: "swe",
      jobTitle: "Principal Cloud Architect",
      company: "Enterprise consultancy",
      yearsExperience: 19,
      specialisms: ["Leadership", "Engineering careers", "Data strategy"],
      bio: "Nearly twenty years across telecoms, government and consulting. I have hired and promoted many engineers and happily write referrals for people I have worked with.",
      isVerified: true,
      openAvailability: false,
      mentoringStyle: "bigpicture",
      availabilityCadence: "monthly",
      availabilityTimes: ["wdevening"],
    },
    8,
    7,
  ],
  [
    "Warm Robin",
    {
      field: "data",
      jobTitle: "Senior Data Engineer",
      company: "State government department",
      yearsExperience: 7,
      specialisms: ["Data strategy", "Engineering careers"],
      bio: "I build the data platforms behind public transport reporting. Public sector careers are underrated, and I can show you how to get in and grow.",
      isVerified: true,
      openAvailability: true,
      mentoringStyle: "flexible",
      availabilityCadence: "fortnightly",
      availabilityTimes: ["wdmorning", "weekend"],
    },
    3,
    2,
  ],
  [
    "Keen Plover",
    {
      field: "swe",
      jobTitle: "Security Engineer",
      company: "Telecommunications provider",
      yearsExperience: 5,
      specialisms: ["Interview prep", "Engineering careers"],
      bio: "I moved from IT support into security engineering. Certifications, home labs and breaking into cyber are my favourite topics.",
      isVerified: false,
      openAvailability: false,
      mentoringStyle: "handson",
      availabilityCadence: "weekly",
      availabilityTimes: ["wdevening", "weekend"],
    },
    0,
    0,
  ],
  [
    "Wise Pelican",
    {
      field: "data",
      jobTitle: "Head of Data Science",
      company: "National retailer",
      yearsExperience: 22,
      specialisms: ["Leadership", "Data strategy", "ML systems"],
      bio: "I lead a team of thirty and sit on hiring and promotion panels. I believe in sponsorship, not just advice, and I put names forward when I see real potential.",
      isVerified: true,
      openAvailability: false,
      mentoringStyle: "bigpicture",
      availabilityCadence: "monthly",
      availabilityTimes: ["wdmorning"],
    },
    9,
    8,
  ],
  [
    "Brave Finch",
    {
      field: "swe",
      jobTitle: "Mobile Engineer",
      company: "Melbourne edtech startup",
      yearsExperience: 3,
      specialisms: ["Interview prep"],
      bio: "I landed my first developer job through a bootcamp and side projects. Happy to review your GitHub and help you plan the next three months.",
      isVerified: false,
      openAvailability: true,
      mentoringStyle: "flexible",
      availabilityCadence: "weekly",
      availabilityTimes: ["weekend"],
    },
    1,
    1,
  ],
  [
    "Patient Egret",
    {
      field: "data",
      jobTitle: "Biostatistician",
      company: "Medical research institute",
      yearsExperience: 10,
      specialisms: ["Data strategy", "Engineering careers"],
      bio: "I work on clinical trials and teach statistics part time. I enjoy helping people bridge research and industry, and I know the grant world well.",
      isVerified: true,
      openAvailability: true,
      mentoringStyle: "structured",
      availabilityCadence: "fortnightly",
      availabilityTimes: ["wdmorning"],
    },
    4,
    3,
  ],
  [
    "Sunny Lorikeet",
    {
      field: "swe",
      jobTitle: "Product Engineering Lead",
      company: "Logistics technology company",
      yearsExperience: 9,
      specialisms: ["Leadership", "Interview prep"],
      bio: "I came back to engineering after a career break to raise two kids. If you are returning to work or balancing caring duties, let us plan a route that works for you.",
      isVerified: true,
      openAvailability: true,
      mentoringStyle: "handson",
      availabilityCadence: "weekly",
      availabilityTimes: ["wdevening", "weekend"],
    },
    5,
    4,
  ],
];

const HISTORY_MENTEE_PROFILE = {
  field: "data",
  careerStage: "recent",
  mentoringStyle: "structured",
  availabilityCadence: "weekly",
  availabilityTimes: ["wdevening"],
  goals: ["direction", "skills"],
};

const HISTORY_NAMES = [
  "Amber Swallow",
  "Lucky Sparrow",
  "Little Owl",
  "Silver Dove",
  "Rosy Starling",
  "Hidden Tern",
  "Merry Thrush",
  "Golden Rail",
  "Tiny Bittern",
];

const ADVOCACY_TYPES = [
  "REFERRAL",
  "INTRODUCTION",
  "NOMINATION",
  "ENDORSEMENT",
];

async function loadAllowedValues() {
  const sources = await Promise.allSettled([
    import("../src/services/mentorProfileService.js"),
    import("../src/services/menteeProfileService.js"),
  ]);
  const merged = {};
  for (const s of sources)
    if (s.status === "fulfilled") Object.assign(merged, s.value);
  const pick = (...names) => names.map((n) => merged[n]).find((v) => v != null);
  const asList = (v) =>
    v == null
      ? null
      : Array.isArray(v)
        ? v
        : v instanceof Set
          ? [...v]
          : Object.keys(v);
  return {
    specialisms: asList(pick("SPECIALISMS")),
    styles: asList(pick("VALID_STYLES")),
    cadences: asList(pick("VALID_CADENCES")),
    times: asList(pick("VALID_TIMES")),
    fields: asList(pick("VALID_FIELDS")),
  };
}

function validate(allowed) {
  const problems = [];
  const check = (list, value, label, name) => {
    if (list && !list.includes(value))
      problems.push(`${name}: ${label} "${value}" is not allowed`);
  };
  for (const [name, p] of MENTORS) {
    check(allowed.fields, p.field, "field", name);
    check(allowed.styles, p.mentoringStyle, "mentoringStyle", name);
    check(allowed.cadences, p.availabilityCadence, "availabilityCadence", name);
    p.availabilityTimes.forEach((t) =>
      check(allowed.times, t, "availabilityTime", name),
    );
    if (allowed.specialisms) {
      const canonical = new Map(
        allowed.specialisms.map((s) => [s.toLowerCase(), s]),
      );
      p.specialisms.forEach((s) => {
        if (!canonical.has(s.toLowerCase()))
          problems.push(`${name}: specialism "${s}" is not allowed`);
      });
      p.specialisms = p.specialisms.map(
        (s) => canonical.get(s.toLowerCase()) ?? s,
      );
    }
    if (p.yearsExperience < 2 || p.yearsExperience > 60)
      problems.push(`${name}: yearsExperience out of range`);
  }
  const missing = Object.entries(allowed)
    .filter(([, v]) => !v)
    .map(([k]) => k);
  return { problems, missing };
}

async function deleteCognitoUser(username) {
  try {
    await cognitoClient.send(
      new AdminDeleteUserCommand({
        UserPoolId: USER_POOL_ID,
        Username: username,
      }),
    );
  } catch (err) {
    if (err.name !== "UserNotFoundException") throw err;
  }
}

async function createCognitoUser(username) {
  const created = await cognitoClient.send(
    new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      MessageAction: "SUPPRESS",
      UserAttributes: [
        { Name: "email", Value: username },
        { Name: "email_verified", Value: "true" },
      ],
    }),
  );
  await cognitoClient.send(
    new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      Password: PASSWORD,
      Permanent: true,
    }),
  );
  const sub = created.User?.Attributes?.find((a) => a.Name === "sub")?.Value;
  if (!sub) throw new Error(`Cognito returned no sub for ${username}`);
  return sub;
}

function allEmails() {
  const mentorEmails = MENTORS.map((_, i) => email(i + 1));
  const historyCount = MENTORS.reduce((max, m) => Math.max(max, m[2]), 0);
  const menteeEmails = Array.from({ length: historyCount }, (_, i) =>
    historyEmail(i + 1),
  );
  return [...mentorEmails, ...menteeEmails];
}

// Hard deletes are deliberate here: these are seeded fixtures, not user data.
async function removeCommunity() {
  const emails = allEmails();
  const users = await prisma.user.findMany({
    where: { syntheticEmail: { in: emails } },
    include: { menteeProfile: true, mentorProfile: true },
  });
  const menteeIds = users.map((u) => u.menteeProfile?.id).filter(Boolean);
  const mentorIds = users.map((u) => u.mentorProfile?.id).filter(Boolean);
  const userIds = users.map((u) => u.id);
  const profileScope = {
    OR: [
      { menteeProfileId: { in: menteeIds } },
      { mentorProfileId: { in: mentorIds } },
    ],
  };

  if (users.length > 0) {
    const mentorships = await prisma.mentorship.findMany({
      where: profileScope,
      select: { id: true },
    });
    const mentorshipIds = mentorships.map((m) => m.id);
    if (mentorshipIds.length > 0) {
      const scope = { where: { mentorshipId: { in: mentorshipIds } } };
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
    await prisma.mentorshipRequest.deleteMany({ where: profileScope });
    await prisma.credential.deleteMany({
      where: { mentorProfileId: { in: mentorIds } },
    });
    await prisma.helpTicket.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.menteeProfile.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.mentorProfile.deleteMany({
      where: { userId: { in: userIds } },
    });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  }

  for (const e of emails) await deleteCognitoUser(e);
  return users.length;
}

async function createUser(username, displayName, role, profile) {
  const cognitoUid = await createCognitoUser(username);
  const relation = role === "MENTOR" ? "mentorProfile" : "menteeProfile";
  return prisma.user.create({
    data: {
      cognitoUid,
      syntheticEmail: username,
      displayName,
      role,
      [relation]: { create: profile },
    },
    include: { [relation]: true },
  });
}

function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function createHistory(
  mentorProfileId,
  historyMentees,
  pastCount,
  advocacyDone,
) {
  let advocacyLeft = advocacyDone;
  for (let i = 0; i < pastCount; i += 1) {
    const mentee = historyMentees[i];
    const startedAt = daysAgo(120 + i * 20);
    const endedAt = daysAgo(30 + i * 10);
    const request = await prisma.mentorshipRequest.create({
      data: {
        menteeProfileId: mentee.menteeProfile.id,
        mentorProfileId,
        status: "ACCEPTED",
      },
    });
    const mentorship = await prisma.mentorship.create({
      data: {
        menteeProfileId: mentee.menteeProfile.id,
        mentorProfileId,
        requestId: request.id,
        status: "ENDED",
        startedAt,
        endedAt,
        endReason:
          "Mentee reached their goal and the mentorship was completed.",
      },
    });
    if (advocacyLeft > 0) {
      await prisma.advocacyRequest.create({
        data: {
          mentorshipId: mentorship.id,
          type: ADVOCACY_TYPES[i % ADVOCACY_TYPES.length],
          status: "DONE",
        },
      });
      advocacyLeft -= 1;
    }
  }
}

async function main() {
  if (!USER_POOL_ID)
    throw new Error("COGNITO_USER_POOL_ID is not set. Check Backend/.env.");

  console.log("Removing existing community accounts...");
  const removed = await removeCommunity();
  console.log(`  removed ${removed} user(s)`);
  if (REMOVE_ONLY) return;

  const allowed = await loadAllowedValues();
  const { problems, missing } = validate(allowed);
  if (missing.length > 0) {
    console.warn(
      `  could not load allowed values for: ${missing.join(", ")} (those checks skipped)`,
    );
  }
  if (problems.length > 0) {
    throw new Error(
      `Profile values do not match the app:\n  ${problems.join("\n  ")}`,
    );
  }

  console.log(`Creating ${MENTORS.length} mentors...`);
  const created = [];
  for (const [i, [displayName, profile]] of MENTORS.entries()) {
    const user = await createUser(email(i + 1), displayName, "MENTOR", {
      ...profile,
      acceptingMentees: true,
      verifiedAt: profile.isVerified ? daysAgo(40) : null,
    });
    created.push(user);
  }

  if (WITH_HISTORY) {
    const historyCount = MENTORS.reduce((max, m) => Math.max(max, m[2]), 0);
    console.log(`Creating ${historyCount} past mentees for track records...`);
    const historyMentees = [];
    for (let i = 0; i < historyCount; i += 1) {
      historyMentees.push(
        await createUser(
          historyEmail(i + 1),
          HISTORY_NAMES[i] ?? `Silent Grebe ${i + 1}`,
          "MENTEE",
          HISTORY_MENTEE_PROFILE,
        ),
      );
    }
    for (const [i, [, , pastCount, advocacyDone]] of MENTORS.entries()) {
      await createHistory(
        created[i].mentorProfile.id,
        historyMentees,
        pastCount,
        advocacyDone,
      );
    }
  }

  console.log("\nDone.\n");
  console.log(`Password for all accounts: ${PASSWORD}\n`);
  MENTORS.forEach(([name, p], i) => {
    const flags = [
      p.isVerified ? "verified" : "unverified",
      p.openAvailability ? "open" : "review",
    ].join(", ");
    console.log(
      `  ${email(i + 1)}  ${name.padEnd(15)} ${p.field.padEnd(5)} ${String(p.yearsExperience).padStart(2)}y  ${flags}`,
    );
  });
  if (!WITH_HISTORY)
    console.log(
      "\n  Track records are 0. Run with --history to add past mentorships.",
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
