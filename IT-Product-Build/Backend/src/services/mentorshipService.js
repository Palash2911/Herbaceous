import { Prisma } from "../../prisma/generated/prisma/client.ts";
import prisma from "../config/prisma.js";
import { isLengthBetween } from "../utils/validate.js";
import { currentWeekNumber } from "../utils/weeks.js";
import { getAdvocacyCounts, listAdvocacyRequests } from "./advocacyService.js";
import { scoreMentorsForMentee } from "./matching/mentorDiscovery.js";
import { getMentorTrackRecords } from "./matching/mentorTrackRecord.js";
import { scoreMentor } from "./matching/scoreMentor.js";
import { getPendingPauseRequest } from "./pauseRequestService.js";
import { getTolerance, getToleranceLevels } from "./toleranceService.js";
import { getWeeklyLogs } from "./weeklyLogService.js";
import { buildWeekTimeline } from "./weekTimeline.js";

const OPEN_MENTORSHIP_STATUSES = ["ACTIVE", "PAUSED"];
const MAX_END_REASON_LENGTH = 1000;

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function requestConflict(requestId) {
  const current = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });
  return makeError(409, `Request already ${current.status.toLowerCase()}`);
}

async function hasActiveOrPausedMentorship(menteeProfileId, client = prisma) {
  const existing = await client.mentorship.findFirst({
    where: { menteeProfileId, status: { in: ["ACTIVE", "PAUSED"] } },
  });
  return Boolean(existing);
}

export async function createRequest(menteeProfileId, mentorProfileId, message) {
  if (await hasActiveOrPausedMentorship(menteeProfileId)) {
    throw makeError(409, "You already have an active mentorship");
  }

  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { id: mentorProfileId },
    select: { acceptingMentees: true, field: true },
  });
  if (!mentorProfile || !mentorProfile.acceptingMentees) {
    throw makeError(400, "This mentor is not accepting mentees");
  }
  if (mentorProfile.field == null) {
    throw makeError(409, "This mentor has not completed onboarding");
  }

  const existingPending = await prisma.mentorshipRequest.findFirst({
    where: { menteeProfileId, mentorProfileId, status: "PENDING" },
  });
  if (existingPending) {
    throw makeError(409, "You already have a pending request with this mentor");
  }

  return prisma.mentorshipRequest.create({
    data: {
      menteeProfileId,
      mentorProfileId,
      message: message ?? null,
      status: "PENDING",
    },
  });
}

export async function listMenteeRequests(menteeProfileId) {
  return prisma.mentorshipRequest.findMany({
    where: { menteeProfileId },
    orderBy: { createdAt: "desc" },
    include: {
      mentorProfile: {
        select: {
          id: true,
          field: true,
          jobTitle: true,
          company: true,
          user: { select: { displayName: true } },
        },
      },
    },
  });
}

export async function withdrawRequest(menteeProfileId, requestId) {
  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.menteeProfileId !== menteeProfileId) {
    throw makeError(404, "Request not found");
  }
  if (request.status !== "PENDING") {
    throw makeError(409, `Request already ${request.status.toLowerCase()}`);
  }

  const { count } = await prisma.mentorshipRequest.updateMany({
    where: { id: requestId, status: "PENDING" },
    data: { status: "WITHDRAWN", respondedAt: new Date() },
  });
  if (count === 0) {
    throw await requestConflict(requestId);
  }

  return prisma.mentorshipRequest.findUnique({ where: { id: requestId } });
}

export async function listMentorRequests(mentorProfileId, status) {
  return prisma.mentorshipRequest.findMany({
    where: {
      mentorProfileId,
      status: status ?? { not: "CLOSED" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      menteeProfile: {
        select: {
          id: true,
          field: true,
          careerStage: true,
          user: { select: { displayName: true } },
        },
      },
    },
  });
}

export async function respondToRequest(
  mentorProfileId,
  requestId,
  action,
  responseNote,
) {
  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw makeError(404, "Request not found");
  }
  if (request.mentorProfileId !== mentorProfileId) {
    throw makeError(403, "This request does not belong to you");
  }

  if (action === "DECLINE") {
    if (request.status !== "PENDING") {
      throw makeError(409, `Request already ${request.status.toLowerCase()}`);
    }
    const { count } = await prisma.mentorshipRequest.updateMany({
      where: { id: requestId, status: "PENDING" },
      data: {
        status: "DECLINED",
        respondedAt: new Date(),
        responseNote: responseNote ?? null,
      },
    });
    if (count === 0) {
      throw await requestConflict(requestId);
    }
    return prisma.mentorshipRequest.findUnique({ where: { id: requestId } });
  }

  if (action === "ACCEPT") {
    return acceptPendingRequest(requestId, { responseNote });
  }
}

export async function startMentorshipNow(menteeProfileId, requestId) {
  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.menteeProfileId !== menteeProfileId) {
    throw makeError(404, "Request not found");
  }

  return acceptPendingRequest(requestId, {
    conflictMessage: "You already have an active mentorship",
    beforeAccept: async (freshRequest, tx) => {
      const mentorProfile = await tx.mentorProfile.findUnique({
        where: { id: freshRequest.mentorProfileId },
        select: { acceptingMentees: true, openAvailability: true },
      });
      if (!mentorProfile?.acceptingMentees) {
        throw makeError(403, "This mentor is not accepting new mentees");
      }
      if (!mentorProfile.openAvailability) {
        throw makeError(403, "This mentor does not have open availability");
      }
    },
  });
}

async function matchScoreForRequest(requestId) {
  const request = await prisma.mentorshipRequest.findUnique({
    where: { id: requestId },
    include: { menteeProfile: true, mentorProfile: true },
  });
  if (!request || request.status !== "PENDING") return null;

  const scores = await scoreMentorsForMentee(request.menteeProfile, [
    request.mentorProfile,
  ]);
  return scores.get(request.mentorProfileId).score;
}

async function acceptPendingRequest(
  requestId,
  {
    responseNote,
    conflictMessage = "This mentee already has an active mentorship",
    beforeAccept,
  } = {},
) {
  const matchScore = await matchScoreForRequest(requestId);

  try {
    return await prisma.$transaction(
      async (tx) => {
        const freshRequest = await tx.mentorshipRequest.findUnique({
          where: { id: requestId },
        });
        if (!freshRequest || freshRequest.status !== "PENDING") {
          throw makeError(
            409,
            `Request already ${(freshRequest?.status ?? "responded to").toLowerCase()}`,
          );
        }
        if (beforeAccept) {
          await beforeAccept(freshRequest, tx);
        }
        if (
          await hasActiveOrPausedMentorship(freshRequest.menteeProfileId, tx)
        ) {
          throw makeError(409, conflictMessage);
        }

        const updatedRequest = await tx.mentorshipRequest.update({
          where: { id: requestId },
          data: {
            status: "ACCEPTED",
            respondedAt: new Date(),
            responseNote: responseNote ?? null,
          },
        });

        const mentorship = await tx.mentorship.create({
          data: {
            menteeProfileId: freshRequest.menteeProfileId,
            mentorProfileId: freshRequest.mentorProfileId,
            requestId: freshRequest.id,
            status: "ACTIVE",
            startedAt: new Date(),
            matchScore,
          },
        });

        await tx.mentorshipRequest.updateMany({
          where: {
            menteeProfileId: freshRequest.menteeProfileId,
            status: "PENDING",
            id: { not: requestId },
          },
          data: { status: "CLOSED", respondedAt: new Date() },
        });

        return { request: updatedRequest, mentorship };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (err) {
    if (err.code === "P2034") {
      throw makeError(409, conflictMessage);
    }
    throw err;
  }
}

export async function getCurrentMentorship({
  menteeProfileId,
  mentorProfileId,
}) {
  const where = menteeProfileId
    ? { menteeProfileId, status: { in: OPEN_MENTORSHIP_STATUSES } }
    : { mentorProfileId, status: { in: OPEN_MENTORSHIP_STATUSES } };

  return prisma.mentorship.findFirst({
    where,
    include: {
      menteeProfile: {
        select: {
          id: true,
          field: true,
          careerStage: true,
          user: { select: { displayName: true } },
        },
      },
      mentorProfile: {
        select: {
          id: true,
          field: true,
          jobTitle: true,
          company: true,
          user: { select: { displayName: true } },
        },
      },
    },
  });
}

export async function getMenteeMentorshipDetail(mentorship) {
  const [mentorProfile, weeksLogged, trackRecords] = await Promise.all([
    prisma.mentorProfile.findUnique({
      where: { id: mentorship.mentorProfileId },
      include: { user: { select: { displayName: true } } },
    }),
    prisma.weeklyLog.count({
      where: { mentorshipId: mentorship.id, status: "DONE" },
    }),
    getMentorTrackRecords([mentorship.mentorProfileId]),
  ]);

  return {
    mentorProfile,
    weeksLogged,
    trackRecord: trackRecords.get(mentorship.mentorProfileId),
  };
}

export async function getMenteeOverviewStats(menteeProfileId, mentorship) {
  const pendingRequestCount = await prisma.mentorshipRequest.count({
    where: { menteeProfileId, status: "PENDING" },
  });

  if (!mentorship) {
    return {
      weeksLogged: 0,
      weekNumber: 0,
      recentWeeks: [],
      matchScore: null,
      activeAdvocacyCount: 0,
      journeyStatus: "NONE",
      pendingRequestCount,
    };
  }

  const weekNumber = currentWeekNumber(mentorship.startedAt);

  const [
    weeklyLogs,
    pauseRequests,
    weeksLogged,
    advocacyCounts,
    mentorProfile,
    menteeProfile,
  ] = await Promise.all([
    prisma.weeklyLog.findMany({ where: { mentorshipId: mentorship.id } }),
    prisma.pauseRequest.findMany({
      where: { mentorshipId: mentorship.id, status: "APPROVED" },
    }),
    prisma.weeklyLog.count({
      where: { mentorshipId: mentorship.id, status: "DONE" },
    }),
    getAdvocacyCounts(mentorship.id),
    prisma.mentorProfile.findUnique({
      where: { id: mentorship.mentorProfileId },
    }),
    prisma.menteeProfile.findUnique({ where: { id: menteeProfileId } }),
  ]);

  const timeline = buildWeekTimeline(mentorship, weeklyLogs, pauseRequests);
  const recentWeeks = timeline
    .slice(-8)
    .map(({ week, status }) => ({ week, status }));

  const matchScore =
    mentorship.matchScore ??
    (mentorProfile && menteeProfile
      ? scoreMentor(menteeProfile, mentorProfile).score
      : null);

  return {
    weeksLogged,
    weekNumber,
    recentWeeks,
    matchScore,
    activeAdvocacyCount: advocacyCounts.pending + advocacyCounts.accepted,
    journeyStatus: mentorship.status,
    pendingRequestCount,
  };
}

function countsByMentorship(rows) {
  return new Map(rows.map((row) => [row.mentorshipId, row._count]));
}

export async function getMentorOverviewStats(mentorProfileId) {
  const openMentorships = {
    mentorProfileId,
    status: { in: OPEN_MENTORSHIP_STATUSES },
  };

  const [
    activeMenteeCount,
    pendingRequestCount,
    pendingAdvocacyCount,
    pendingPauseCount,
  ] = await Promise.all([
    prisma.mentorship.count({ where: openMentorships }),
    prisma.mentorshipRequest.count({
      where: { mentorProfileId, status: "PENDING" },
    }),
    prisma.advocacyRequest.count({
      where: { status: "PENDING", mentorship: openMentorships },
    }),
    prisma.pauseRequest.count({
      where: { status: "PENDING", mentorship: openMentorships },
    }),
  ]);

  return {
    activeMenteeCount,
    pendingRequestCount,
    pendingAdvocacyCount,
    pendingPauseCount,
  };
}

export async function listMentorMentees(mentorProfileId, status) {
  const mentorships = await prisma.mentorship.findMany({
    where: {
      mentorProfileId,
      status: status ?? { in: OPEN_MENTORSHIP_STATUSES },
    },
    orderBy: { startedAt: "desc" },
    include: {
      menteeProfile: {
        select: {
          id: true,
          field: true,
          careerStage: true,
          user: { select: { displayName: true } },
        },
      },
    },
  });

  const mentorshipIds = mentorships.map((m) => m.id);

  const [doneRows, toleranceLevels, pauseRows, advocacyRows] =
    await Promise.all([
      prisma.weeklyLog.groupBy({
        by: ["mentorshipId"],
        where: { mentorshipId: { in: mentorshipIds }, status: "DONE" },
        _count: true,
      }),
      getToleranceLevels(mentorshipIds),
      prisma.pauseRequest.groupBy({
        by: ["mentorshipId"],
        where: { mentorshipId: { in: mentorshipIds }, status: "PENDING" },
        _count: true,
      }),
      prisma.advocacyRequest.groupBy({
        by: ["mentorshipId"],
        where: { mentorshipId: { in: mentorshipIds }, status: "PENDING" },
        _count: true,
      }),
    ]);

  const weeksLogged = countsByMentorship(doneRows);
  const pendingPauses = countsByMentorship(pauseRows);
  const pendingAdvocacy = countsByMentorship(advocacyRows);

  return mentorships.map((m) => ({
    id: m.id,
    status: m.status,
    startedAt: m.startedAt,
    endedAt: m.endedAt,
    weeksLogged: weeksLogged.get(m.id) ?? 0,
    toleranceLevel: toleranceLevels.get(m.id) ?? 0,
    pendingPauseCount: pendingPauses.get(m.id) ?? 0,
    pendingAdvocacyCount: pendingAdvocacy.get(m.id) ?? 0,
    mentee: {
      id: m.menteeProfile.id,
      displayName: m.menteeProfile.user.displayName,
      field: m.menteeProfile.field,
      careerStage: m.menteeProfile.careerStage,
    },
  }));
}

export async function getMentorMenteeDetail(mentorProfile, mentorship) {
  const [
    menteeProfile,
    weekly,
    tolerance,
    pendingPauseRequest,
    advocacy,
  ] = await Promise.all([
    prisma.menteeProfile.findUnique({
      where: { id: mentorship.menteeProfileId },
      include: { user: { select: { displayName: true } } },
    }),
    getWeeklyLogs(mentorship),
    getTolerance(mentorship),
    getPendingPauseRequest(mentorship.id),
    listAdvocacyRequests(mentorship),
  ]);

  return {
    id: mentorship.id,
    status: mentorship.status,
    startedAt: mentorship.startedAt,
    endedAt: mentorship.endedAt,
    endReason: mentorship.endReason,
    weekNumber: weekly.weekNumber,
    weeksLogged: weekly.weeksLogged,
    chatRoomUrl: mentorship.chatRoomUrl,
    matchScore:
      mentorship.matchScore ?? scoreMentor(menteeProfile, mentorProfile).score,
    mentee: {
      id: menteeProfile.id,
      displayName: menteeProfile.user.displayName,
      field: menteeProfile.field,
      careerStage: menteeProfile.careerStage,
      goals: menteeProfile.goals,
      about: menteeProfile.about,
      mentoringStyle: menteeProfile.mentoringStyle,
      availabilityCadence: menteeProfile.availabilityCadence,
      availabilityTimes: menteeProfile.availabilityTimes,
    },
    weeks: weekly.weeks,
    tolerance,
    pendingPauseRequest,
    advocacy: {
      requests: advocacy.requests.filter((r) => r.status !== "WITHDRAWN"),
      counts: advocacy.counts,
    },
  };
}

export async function endMentorship(mentorProfile, mentorship, userId, reason) {
  const trimmedReason = typeof reason === "string" ? reason.trim() : "";
  if (!isLengthBetween(trimmedReason, 1, MAX_END_REASON_LENGTH)) {
    throw makeError(
      400,
      `reason is required and must be ${MAX_END_REASON_LENGTH} characters or fewer`,
    );
  }

  const endedAt = new Date();

  return prisma.$transaction(async (tx) => {
    const { count } = await tx.mentorship.updateMany({
      where: {
        id: mentorship.id,
        mentorProfileId: mentorProfile.id,
        status: { in: OPEN_MENTORSHIP_STATUSES },
      },
      data: {
        status: "ENDED",
        endedAt,
        endReason: trimmedReason,
        endedById: userId,
      },
    });
    if (count === 0) {
      throw makeError(409, "Mentorship has ended");
    }

    const closedPauses = await tx.pauseRequest.updateMany({
      where: { mentorshipId: mentorship.id, status: "PENDING" },
      data: { status: "CLOSED" },
    });
    const closedAdvocacy = await tx.advocacyRequest.updateMany({
      where: { mentorshipId: mentorship.id, status: { in: ["PENDING", "ACCEPTED"] } },
      data: { status: "CLOSED" },
    });

    return {
      id: mentorship.id,
      status: "ENDED",
      endedAt,
      endReason: trimmedReason,
      closedPauseRequests: closedPauses.count,
      closedAdvocacyRequests: closedAdvocacy.count,
    };
  });
}

export { hasActiveOrPausedMentorship };
