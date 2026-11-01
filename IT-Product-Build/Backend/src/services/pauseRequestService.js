import prisma from "../config/prisma.js";
import { isLengthBetween, isOneOf, isPositiveInt } from "../utils/validate.js";

const VALID_TYPES = ["PAUSE", "RESUME"];
const MAX_EXPECTED_WEEKS = 12;
const MAX_REASON_LENGTH = 500;

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function createPauseRequest(mentorship, userId, { type, reason, expectedWeeks }) {
  if (!isOneOf(type, VALID_TYPES)) {
    throw makeError(400, `type must be one of ${VALID_TYPES.join(", ")}`);
  }
  const trimmedReason = typeof reason === "string" ? reason.trim() : "";
  if (!isLengthBetween(trimmedReason, 1, MAX_REASON_LENGTH)) {
    throw makeError(400, `reason is required and must be ${MAX_REASON_LENGTH} characters or fewer`);
  }

  if (type === "PAUSE") {
    if (mentorship.status !== "ACTIVE") {
      throw makeError(409, "Mentorship must be ACTIVE to request a pause");
    }
    if (!isPositiveInt(expectedWeeks, MAX_EXPECTED_WEEKS)) {
      throw makeError(400, `expectedWeeks is required and must be 1 to ${MAX_EXPECTED_WEEKS}`);
    }
  } else {
    if (mentorship.status !== "PAUSED") {
      throw makeError(409, "Mentorship must be PAUSED to request a resume");
    }
    if (expectedWeeks != null) {
      throw makeError(400, "expectedWeeks must not be sent for a resume request");
    }
  }

  const existingPending = await prisma.pauseRequest.findFirst({
    where: { mentorshipId: mentorship.id, status: "PENDING" },
  });
  if (existingPending) {
    throw makeError(409, "A pause request is already pending");
  }

  return prisma.pauseRequest.create({
    data: {
      mentorshipId: mentorship.id,
      requestedById: userId,
      type,
      reason: trimmedReason,
      expectedWeeks: expectedWeeks ?? null,
      status: "PENDING",
    },
  });
}

export async function listPauseRequests(mentorship) {
  if (!mentorship) return [];

  return prisma.pauseRequest.findMany({
    where: { mentorshipId: mentorship.id },
    orderBy: { createdAt: "desc" },
  });
}

async function respondedConflict(client, requestId) {
  const current = await client.pauseRequest.findUnique({ where: { id: requestId } });
  return makeError(409, `Pause request already ${current.status.toLowerCase()}`);
}

export async function withdrawPauseRequest(mentorship, requestId) {
  const request = await prisma.pauseRequest.findUnique({ where: { id: requestId } });
  if (!request || !mentorship || request.mentorshipId !== mentorship.id) {
    throw makeError(404, "Pause request not found");
  }

  const { count } = await prisma.pauseRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: { status: "WITHDRAWN", respondedAt: new Date() },
  });
  if (count === 0) {
    throw await respondedConflict(prisma, requestId);
  }

  return prisma.pauseRequest.findUnique({ where: { id: requestId } });
}

const APPROVAL_TRANSITIONS = {
  PAUSE: {
    from: "ACTIVE",
    to: "PAUSED",
    conflict: "Mentorship must be ACTIVE to approve a pause",
  },
  RESUME: {
    from: "PAUSED",
    to: "ACTIVE",
    conflict: "Mentorship must be PAUSED to approve a resume",
  },
};

export async function respondToPauseRequest(mentorship, requestId, action, responseNote) {
  const request = await prisma.pauseRequest.findFirst({
    where: { id: requestId, mentorshipId: mentorship.id },
  });
  if (!request) {
    throw makeError(404, "Pause request not found");
  }

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.pauseRequest.updateMany({
      where: { id: requestId, mentorshipId: mentorship.id, status: "PENDING" },
      data: {
        status: action === "APPROVE" ? "APPROVED" : "DECLINED",
        respondedAt: new Date(),
        responseNote: responseNote ?? null,
      },
    });
    if (count === 0) {
      throw await respondedConflict(tx, requestId);
    }

    let mentorshipStatus = mentorship.status;
    if (action === "APPROVE") {
      const transition = APPROVAL_TRANSITIONS[request.type];
      const flipped = await tx.mentorship.updateMany({
        where: { id: mentorship.id, status: transition.from },
        data: { status: transition.to },
      });
      if (flipped.count === 0) {
        throw makeError(409, transition.conflict);
      }
      mentorshipStatus = transition.to;
    }

    return {
      request: await tx.pauseRequest.findUnique({ where: { id: requestId } }),
      mentorship: { id: mentorship.id, status: mentorshipStatus },
    };
  });
}

export async function getPendingPauseRequest(mentorshipId) {
  if (!mentorshipId) return null;

  return prisma.pauseRequest.findFirst({
    where: { mentorshipId, status: "PENDING" },
  });
}
