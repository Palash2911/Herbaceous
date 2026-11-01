import prisma from "../config/prisma.js";
import { isLengthBetween } from "../utils/validate.js";

const VALID_TYPES = ["REFERRAL", "INTRODUCTION", "NOMINATION", "ENDORSEMENT", "OTHER"];
const MAX_DETAILS_LENGTH = 1000;

const EMPTY_COUNTS = {
  pending: 0,
  accepted: 0,
  done: 0,
  declined: 0,
  withdrawn: 0,
  closed: 0,
};

const OPEN_MENTORSHIP_STATUSES = ["ACTIVE", "PAUSED"];

const RESPONSE_TRANSITIONS = {
  ACCEPT: { from: "PENDING", to: "ACCEPTED", timestamp: "respondedAt" },
  DECLINE: { from: "PENDING", to: "DECLINED", timestamp: "respondedAt" },
  DONE: { from: "ACCEPTED", to: "DONE", timestamp: "completedAt" },
};

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function respondedConflict(requestId, action) {
  const current = await prisma.advocacyRequest.findUnique({ where: { id: requestId } });
  if (action === "DONE" && current.status === "PENDING") {
    return makeError(409, "Advocacy request must be accepted before it can be marked done");
  }
  return makeError(409, `Advocacy request already ${current.status.toLowerCase()}`);
}

export async function getAdvocacyCounts(mentorshipId) {
  if (!mentorshipId) return { ...EMPTY_COUNTS };

  const rows = await prisma.advocacyRequest.groupBy({
    by: ["status"],
    where: { mentorshipId },
    _count: true,
  });

  const counts = { ...EMPTY_COUNTS };
  for (const row of rows) {
    const key = row.status.toLowerCase();
    if (key in counts) counts[key] = row._count;
  }
  return counts;
}

export async function listAdvocacyRequests(mentorship) {
  if (!mentorship) {
    return { requests: [], counts: { ...EMPTY_COUNTS } };
  }

  const [requests, counts] = await Promise.all([
    prisma.advocacyRequest.findMany({
      where: { mentorshipId: mentorship.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        type: true,
        details: true,
        status: true,
        mentorNote: true,
        createdAt: true,
        respondedAt: true,
        completedAt: true,
      },
    }),
    getAdvocacyCounts(mentorship.id),
  ]);

  return { requests, counts };
}

export async function createAdvocacyRequest(mentorship, { type, details }) {
  if (!VALID_TYPES.includes(type)) {
    throw makeError(400, `type must be one of ${VALID_TYPES.join(", ")}`);
  }
  if (mentorship.status === "PAUSED") {
    throw makeError(409, "Mentorship is paused");
  }

  const trimmedDetails = typeof details === "string" ? details.trim() : details;

  if (type === "OTHER") {
    if (!isLengthBetween(trimmedDetails ?? "", 1, MAX_DETAILS_LENGTH)) {
      throw makeError(
        400,
        `details is required for OTHER and must be ${MAX_DETAILS_LENGTH} characters or fewer`,
      );
    }
  } else if (details != null && (typeof details !== "string" || trimmedDetails.length > MAX_DETAILS_LENGTH)) {
    throw makeError(400, `details must be ${MAX_DETAILS_LENGTH} characters or fewer`);
  }

  const existingPending = await prisma.advocacyRequest.findFirst({
    where: { mentorshipId: mentorship.id, type, status: "PENDING" },
  });
  if (existingPending) {
    throw makeError(409, "You already have a pending request of this type");
  }

  return prisma.advocacyRequest.create({
    data: {
      mentorshipId: mentorship.id,
      type,
      details: trimmedDetails || null,
      status: "PENDING",
    },
  });
}

export async function withdrawAdvocacyRequest(mentorship, requestId) {
  const request = await prisma.advocacyRequest.findUnique({ where: { id: requestId } });
  if (!request || !mentorship || request.mentorshipId !== mentorship.id) {
    throw makeError(404, "Advocacy request not found");
  }

  const { count } = await prisma.advocacyRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: { status: "WITHDRAWN", respondedAt: new Date() },
  });
  if (count === 0) {
    throw await respondedConflict(requestId);
  }

  return prisma.advocacyRequest.findUnique({ where: { id: requestId } });
}

export async function respondToAdvocacyRequest(mentorship, requestId, action, responseNote) {
  const request = await prisma.advocacyRequest.findFirst({
    where: { id: requestId, mentorshipId: mentorship.id },
    select: { id: true },
  });
  if (!request) {
    throw makeError(404, "Advocacy request not found");
  }

  const transition = RESPONSE_TRANSITIONS[action];
  const note = typeof responseNote === "string" ? responseNote.trim() : "";

  const { count } = await prisma.advocacyRequest.updateMany({
    where: { id: requestId, mentorshipId: mentorship.id, status: transition.from },
    data: {
      status: transition.to,
      [transition.timestamp]: new Date(),
      ...(note ? { mentorNote: note } : {}),
    },
  });
  if (count === 0) {
    throw await respondedConflict(requestId, action);
  }

  return prisma.advocacyRequest.findUnique({ where: { id: requestId } });
}

export async function listMentorAdvocacyRequests(mentorProfileId, { status, includeEnded } = {}) {
  const mentorshipStatuses = includeEnded
    ? [...OPEN_MENTORSHIP_STATUSES, "ENDED"]
    : OPEN_MENTORSHIP_STATUSES;

  const requests = await prisma.advocacyRequest.findMany({
    where: {
      status: status ?? { not: "WITHDRAWN" },
      mentorship: { mentorProfileId, status: { in: mentorshipStatuses } },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      mentorshipId: true,
      type: true,
      details: true,
      status: true,
      mentorNote: true,
      createdAt: true,
      respondedAt: true,
      completedAt: true,
      mentorship: {
        select: {
          status: true,
          menteeProfile: {
            select: { id: true, user: { select: { displayName: true } } },
          },
        },
      },
    },
  });

  const mentorshipIds = [...new Set(requests.map((r) => r.mentorshipId))];
  const doneRows = await prisma.weeklyLog.groupBy({
    by: ["mentorshipId"],
    where: { mentorshipId: { in: mentorshipIds }, status: "DONE" },
    _count: true,
  });
  const weeksLogged = new Map(doneRows.map((row) => [row.mentorshipId, row._count]));

  return requests.map((r) => ({
    id: r.id,
    mentorshipId: r.mentorshipId,
    type: r.type,
    details: r.details,
    status: r.status,
    mentorNote: r.mentorNote,
    createdAt: r.createdAt,
    respondedAt: r.respondedAt,
    completedAt: r.completedAt,
    weeksLogged: weeksLogged.get(r.mentorshipId) ?? 0,
    mentorshipStatus: r.mentorship.status,
    mentee: {
      id: r.mentorship.menteeProfile.id,
      displayName: r.mentorship.menteeProfile.user.displayName,
    },
  }));
}
