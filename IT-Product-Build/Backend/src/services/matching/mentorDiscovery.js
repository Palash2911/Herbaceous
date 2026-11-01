import prisma from "../../config/prisma.js";
import { scoreMentor } from "./scoreMentor.js";
import { toMentorCard } from "./mentorCard.js";
import { getMentorTrackRecords } from "./mentorTrackRecord.js";
import { scoreMentorsRemote } from "./matchingClient.js";

async function pendingRequestIdsByMentor(menteeProfileId) {
  const pending = await prisma.mentorshipRequest.findMany({
    where: { menteeProfileId, status: "PENDING" },
    select: { id: true, mentorProfileId: true },
  });
  return new Map(pending.map((r) => [r.mentorProfileId, r.id]));
}

function sortMentors(scored, sort) {
  if (sort === "experience") {
    return scored.sort(
      (a, b) => (b.mentorProfile.yearsExperience ?? -1) - (a.mentorProfile.yearsExperience ?? -1),
    );
  }
  return scored.sort((a, b) => b.scoreResult.score - a.scoreResult.score);
}

export async function scoreMentorsForMentee(menteeProfile, mentorProfiles) {
  const remoteResults = await scoreMentorsRemote(menteeProfile, mentorProfiles);
  return new Map(
    mentorProfiles.map((mentorProfile) => [
      mentorProfile.id,
      remoteResults?.get(mentorProfile.id) ?? scoreMentor(menteeProfile, mentorProfile),
    ]),
  );
}

export async function listMentorsForMentee(
  menteeProfile,
  { field, verified, sort = "score", limit = 20, offset = 0 } = {},
) {
  const where = {
    acceptingMentees: true,
    field: { not: null },
    ...(field ? { field } : {}),
    ...(verified != null ? { isVerified: verified } : {}),
  };

  const [mentorProfiles, pendingIds] = await Promise.all([
    prisma.mentorProfile.findMany({
      where,
      include: { user: { select: { displayName: true } } },
    }),
    pendingRequestIdsByMentor(menteeProfile.id),
  ]);

  const scores = await scoreMentorsForMentee(menteeProfile, mentorProfiles);

  const scored = mentorProfiles.map((mentorProfile) => ({
    mentorProfile,
    scoreResult: scores.get(mentorProfile.id),
  }));

  sortMentors(scored, sort);

  const page = scored.slice(offset, offset + limit);
  const trackRecords = await getMentorTrackRecords(
    page.map(({ mentorProfile }) => mentorProfile.id),
  );

  return {
    total: scored.length,
    mentors: page.map(({ mentorProfile, scoreResult }) =>
      toMentorCard(mentorProfile, scoreResult, pendingIds.get(mentorProfile.id) ?? null, {
        trackRecord: trackRecords.get(mentorProfile.id),
      }),
    ),
  };
}

export async function getMentorForMentee(menteeProfile, mentorProfileId) {
  const mentorProfile = await prisma.mentorProfile.findUnique({
    where: { id: mentorProfileId },
    include: { user: { select: { displayName: true } } },
  });

  if (!mentorProfile || !mentorProfile.acceptingMentees || mentorProfile.field == null) {
    return null;
  }

  const [pendingIds, trackRecords] = await Promise.all([
    pendingRequestIdsByMentor(menteeProfile.id),
    getMentorTrackRecords([mentorProfile.id]),
  ]);
  const scores = await scoreMentorsForMentee(menteeProfile, [mentorProfile]);
  const scoreResult = scores.get(mentorProfile.id);

  return toMentorCard(
    mentorProfile,
    scoreResult,
    pendingIds.get(mentorProfile.id) ?? null,
    { withBio: true, trackRecord: trackRecords.get(mentorProfile.id) },
  );
}
