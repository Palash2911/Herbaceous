import prisma from "../config/prisma.js";
import { isHttpsUrl } from "../utils/validate.js";

export const MAX_LABEL_LENGTH = 60;

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function listMeetingLinks(mentorship, userId) {
  const links = await prisma.meetingLink.findMany({
    where: { mentorshipId: mentorship.id },
    orderBy: { createdAt: "desc" },
  });

  const creatorIds = [...new Set(links.map((l) => l.createdById))];
  const creators = await prisma.user.findMany({
    where: { id: { in: creatorIds } },
    select: { id: true, displayName: true },
  });
  const nameById = new Map(creators.map((u) => [u.id, u.displayName]));

  return links.map((link) => ({
    id: link.id,
    url: link.url,
    label: link.label,
    createdBy: nameById.get(link.createdById) ?? null,
    isMine: link.createdById === userId,
    createdAt: link.createdAt,
  }));
}

export function validateMeetingLinkInput({ url, label }) {
  if (!isHttpsUrl(url, 500)) {
    throw makeError(400, "url must be a valid https URL");
  }
  if (label != null && (typeof label !== "string" || label.length > MAX_LABEL_LENGTH)) {
    throw makeError(400, `label must be ${MAX_LABEL_LENGTH} characters or fewer`);
  }
}

export async function createMeetingLink(mentorship, user, { url, label }, client = prisma) {
  validateMeetingLinkInput({ url, label });

  return client.meetingLink.create({
    data: {
      mentorshipId: mentorship.id,
      url,
      label: label ?? null,
      createdById: user.id,
    },
  });
}
