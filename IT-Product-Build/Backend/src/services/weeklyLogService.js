import prisma from "../config/prisma.js";
import { currentWeekNumber, mentorshipClock } from "../utils/weeks.js";
import { buildWeekTimeline } from "./weekTimeline.js";

const VALID_STATUSES = ["DONE", "SKIPPED"];
const MAX_NOTE_LENGTH = 1000;

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function isWithinGraceWindow(weekNumber, currentWeek) {
  return (
    weekNumber === currentWeek || (weekNumber === currentWeek - 1 && currentWeek - 1 >= 1)
  );
}

async function fetchTimelineInputs(mentorshipId) {
  const [weeklyLogs, pauseRequests] = await Promise.all([
    prisma.weeklyLog.findMany({ where: { mentorshipId } }),
    prisma.pauseRequest.findMany({ where: { mentorshipId, status: "APPROVED" } }),
  ]);
  return { weeklyLogs, pauseRequests };
}

export async function getWeeklyLogs(mentorship) {
  const { weeklyLogs, pauseRequests } = await fetchTimelineInputs(mentorship.id);

  const now = mentorshipClock(mentorship);
  const weekNumber = currentWeekNumber(mentorship.startedAt, now);
  const weeksLogged = weeklyLogs.filter((log) => log.status === "DONE").length;
  const weeks = buildWeekTimeline(mentorship, weeklyLogs, pauseRequests, now).reverse();

  return { weekNumber, weeksLogged, weeks };
}

export async function createWeeklyLog(mentorship, { status, note, weekNumber }) {
  if (!VALID_STATUSES.includes(status)) {
    throw makeError(400, `status must be one of ${VALID_STATUSES.join(", ")}`);
  }
  if (note != null && (typeof note !== "string" || note.length > MAX_NOTE_LENGTH)) {
    throw makeError(400, `note must be a string of ${MAX_NOTE_LENGTH} characters or fewer`);
  }

  const currentWeek = currentWeekNumber(mentorship.startedAt);
  const targetWeek = weekNumber == null ? currentWeek : weekNumber;
  if (!Number.isInteger(targetWeek) || !isWithinGraceWindow(targetWeek, currentWeek)) {
    throw makeError(400, "weekNumber must be the current week or the week before it");
  }

  if (mentorship.status === "PAUSED") {
    throw makeError(409, "Mentorship is paused");
  }

  let log;
  try {
    log = await prisma.weeklyLog.create({
      data: {
        mentorshipId: mentorship.id,
        weekNumber: targetWeek,
        status,
        note: note ?? null,
      },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw makeError(409, "Week already logged");
    }
    throw err;
  }

  const weeksLogged = await prisma.weeklyLog.count({
    where: { mentorshipId: mentorship.id, status: "DONE" },
  });

  return { log, weeksLogged };
}

export async function updateWeeklyLog(mentorship, logId, { status, note }) {
  const log = await prisma.weeklyLog.findUnique({ where: { id: logId } });
  if (!log || log.mentorshipId !== mentorship.id) {
    throw makeError(404, "Weekly log not found");
  }

  if (status === undefined && note === undefined) {
    throw makeError(400, "At least one of status or note is required");
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    throw makeError(400, `status must be one of ${VALID_STATUSES.join(", ")}`);
  }
  if (note !== undefined && note != null && (typeof note !== "string" || note.length > MAX_NOTE_LENGTH)) {
    throw makeError(400, `note must be a string of ${MAX_NOTE_LENGTH} characters or fewer`);
  }

  if (mentorship.status === "PAUSED") {
    throw makeError(409, "Mentorship is paused");
  }

  const currentWeek = currentWeekNumber(mentorship.startedAt);
  if (!isWithinGraceWindow(log.weekNumber, currentWeek)) {
    throw makeError(409, "This week can no longer be edited");
  }

  return prisma.weeklyLog.update({
    where: { id: logId },
    data: {
      ...(status !== undefined ? { status } : {}),
      ...(note !== undefined ? { note } : {}),
    },
  });
}
