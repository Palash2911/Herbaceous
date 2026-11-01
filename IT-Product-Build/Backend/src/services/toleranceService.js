import { ToleranceCategory } from "../../prisma/generated/prisma/enums.ts";
import prisma from "../config/prisma.js";
import { isLengthBetween } from "../utils/validate.js";

const VALID_CATEGORIES = Object.values(ToleranceCategory);
const MAX_REASON_LENGTH = 1000;

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function getTolerance(mentorship) {
  if (!mentorship) {
    return { level: 0, events: [] };
  }

  const events = await prisma.toleranceEvent.findMany({
    where: { mentorshipId: mentorship.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      category: true,
      reason: true,
      createdAt: true,
    },
  });

  return { level: events.length, events };
}

export async function getToleranceLevels(mentorshipIds) {
  const rows = await prisma.toleranceEvent.groupBy({
    by: ["mentorshipId"],
    where: { mentorshipId: { in: mentorshipIds } },
    _count: true,
  });

  return new Map(rows.map((row) => [row.mentorshipId, row._count]));
}

export async function createToleranceEvent(mentorship, userId, { category, reason }) {
  if (!VALID_CATEGORIES.includes(category)) {
    throw makeError(400, `category must be one of ${VALID_CATEGORIES.join(", ")}`);
  }

  const trimmedReason = typeof reason === "string" ? reason.trim() : "";
  if (!isLengthBetween(trimmedReason, 1, MAX_REASON_LENGTH)) {
    throw makeError(
      400,
      `reason is required and must be ${MAX_REASON_LENGTH} characters or fewer`,
    );
  }

  const event = await prisma.toleranceEvent.create({
    data: {
      mentorshipId: mentorship.id,
      category,
      reason: trimmedReason,
      createdById: userId,
    },
    select: { id: true, category: true, reason: true, createdAt: true },
  });

  const level = await prisma.toleranceEvent.count({
    where: { mentorshipId: mentorship.id },
  });

  return { event, level };
}
