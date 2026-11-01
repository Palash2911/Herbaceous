import prisma from "../../config/prisma.js";

export const EMPTY_TRACK_RECORD = { menteesMentored: 0, advocacyGiven: 0 };

export async function getMentorTrackRecords(mentorProfileIds) {
  const ids = [...new Set(mentorProfileIds)];
  const records = new Map(ids.map((id) => [id, { ...EMPTY_TRACK_RECORD }]));
  if (ids.length === 0) return records;

  const [menteePairs, advocacyRows] = await Promise.all([
    prisma.mentorship.groupBy({
      by: ["mentorProfileId", "menteeProfileId"],
      where: { mentorProfileId: { in: ids } },
    }),
    prisma.mentorship.findMany({
      where: {
        mentorProfileId: { in: ids },
        advocacyRequests: { some: { status: "DONE" } },
      },
      select: {
        mentorProfileId: true,
        _count: {
          select: { advocacyRequests: { where: { status: "DONE" } } },
        },
      },
    }),
  ]);

  for (const pair of menteePairs) {
    records.get(pair.mentorProfileId).menteesMentored += 1;
  }
  for (const row of advocacyRows) {
    records.get(row.mentorProfileId).advocacyGiven += row._count.advocacyRequests;
  }

  return records;
}
