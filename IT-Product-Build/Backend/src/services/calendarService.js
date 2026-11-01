import prisma from "../config/prisma.js";
import { isLengthBetween } from "../utils/validate.js";
import {
  createMeetingLink,
  MAX_LABEL_LENGTH,
  validateMeetingLinkInput,
} from "./meetingLinkService.js";

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_FROM_MS = 30 * MS_PER_DAY;
const DEFAULT_TO_MS = 60 * MS_PER_DAY;
const MAX_RANGE_MS = 180 * MS_PER_DAY;
const STARTS_AT_MIN_MS = MS_PER_DAY;
const STARTS_AT_MAX_MS = 365 * MS_PER_DAY;

const VALID_TYPES = ["MEETING", "REMINDER", "NOTE"];
const MAX_TITLE_LENGTH = 100;
const MAX_NOTE_LENGTH = 500;

const EVENT_INCLUDE = {
  meetingLink: { select: { id: true, url: true, label: true } },
  creator: { select: { displayName: true } },
};

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function mapEvent(event, userId) {
  return {
    id: event.id,
    type: event.type,
    title: event.title,
    note: event.note,
    startsAt: event.startsAt,
    status: event.status,
    meetingLink: event.meetingLink
      ? { id: event.meetingLink.id, url: event.meetingLink.url, label: event.meetingLink.label }
      : null,
    createdBy: event.creator.displayName,
    isMine: event.createdById === userId,
    createdAt: event.createdAt,
  };
}

function parseDateParam(raw) {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw makeError(400, "from/to must be valid dates");
  }
  return date;
}

function validateStartsAt(raw) {
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    throw makeError(400, "startsAt must be a valid date");
  }
  const now = Date.now();
  if (date.getTime() < now - STARTS_AT_MIN_MS || date.getTime() > now + STARTS_AT_MAX_MS) {
    throw makeError(400, "startsAt must be between yesterday and 365 days from now");
  }
  return date;
}

export async function listCalendarEvents(mentorship, userId, { from, to, includeCancelled }) {
  const now = Date.now();
  const rangeFrom = from != null ? parseDateParam(from) : new Date(now - DEFAULT_FROM_MS);
  const rangeTo = to != null ? parseDateParam(to) : new Date(now + DEFAULT_TO_MS);

  if (rangeTo < rangeFrom) {
    throw makeError(400, "to must be after from");
  }
  if (rangeTo.getTime() - rangeFrom.getTime() > MAX_RANGE_MS) {
    throw makeError(400, "date range must be 180 days or fewer");
  }

  const events = await prisma.calendarEvent.findMany({
    where: {
      mentorshipId: mentorship.id,
      ...(includeCancelled ? {} : { status: "SCHEDULED" }),
      OR: [
        { startsAt: { gte: rangeFrom, lte: rangeTo } },
        { type: "NOTE", startsAt: null },
      ],
    },
    include: EVENT_INCLUDE,
  });

  const logs = await prisma.weeklyLog.findMany({
    where: {
      mentorshipId: mentorship.id,
      createdAt: { gte: rangeFrom, lte: rangeTo },
    },
  });

  const mapped = events.map((event) => mapEvent(event, userId));
  const derived = logs.map((log) => ({
    id: `log-${log.id}`,
    type: "LOG",
    title: log.status === "DONE" ? `Week ${log.weekNumber} logged` : `Week ${log.weekNumber} skipped`,
    startsAt: log.createdAt,
    derived: true,
  }));

  const all = [...mapped, ...derived];
  all.sort((a, b) => {
    if (a.startsAt == null && b.startsAt == null) return 0;
    if (a.startsAt == null) return 1;
    if (b.startsAt == null) return -1;
    return new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();
  });

  return all;
}

export async function createCalendarEvent(mentorship, user, body) {
  const { type, title, note, startsAt, meetingLinkId, meetingUrl, meetingLabel } = body;

  if (!VALID_TYPES.includes(type)) {
    throw makeError(400, `type must be one of ${VALID_TYPES.join(", ")}`);
  }
  const trimmedTitle = typeof title === "string" ? title.trim() : title;
  if (!isLengthBetween(trimmedTitle, 1, MAX_TITLE_LENGTH)) {
    throw makeError(400, `title must be 1 to ${MAX_TITLE_LENGTH} characters`);
  }
  if (note != null && (typeof note !== "string" || note.length > MAX_NOTE_LENGTH)) {
    throw makeError(400, `note must be ${MAX_NOTE_LENGTH} characters or fewer`);
  }

  let startsAtDate = null;
  if (type === "NOTE") {
    if (startsAt != null) startsAtDate = validateStartsAt(startsAt);
  } else {
    if (startsAt == null) {
      throw makeError(400, `startsAt is required for ${type} events`);
    }
    startsAtDate = validateStartsAt(startsAt);
  }

  if (type !== "MEETING" && (meetingLinkId != null || meetingUrl != null)) {
    throw makeError(400, "meetingLinkId and meetingUrl are only allowed for MEETING events");
  }
  if (meetingLinkId != null && meetingUrl != null) {
    throw makeError(400, "cannot set both meetingLinkId and meetingUrl");
  }

  if (meetingLinkId != null) {
    const link = await prisma.meetingLink.findUnique({ where: { id: meetingLinkId } });
    if (!link || link.mentorshipId !== mentorship.id) {
      throw makeError(400, "meetingLinkId does not belong to this mentorship");
    }

    const event = await prisma.calendarEvent.create({
      data: {
        mentorshipId: mentorship.id,
        type,
        title: trimmedTitle,
        note: note ?? null,
        startsAt: startsAtDate,
        meetingLinkId,
        status: "SCHEDULED",
        createdById: user.id,
      },
      include: EVENT_INCLUDE,
    });
    return mapEvent(event, user.id);
  }

  if (meetingUrl != null) {
    validateMeetingLinkInput({ url: meetingUrl, label: meetingLabel });

    return prisma.$transaction(async (tx) => {
      const link = await createMeetingLink(
        mentorship,
        user,
        {
          url: meetingUrl,
          label: meetingLabel ?? trimmedTitle.slice(0, MAX_LABEL_LENGTH).trimEnd(),
        },
        tx,
      );

      const event = await tx.calendarEvent.create({
        data: {
          mentorshipId: mentorship.id,
          type,
          title: trimmedTitle,
          note: note ?? null,
          startsAt: startsAtDate,
          meetingLinkId: link.id,
          status: "SCHEDULED",
          createdById: user.id,
        },
        include: EVENT_INCLUDE,
      });
      return mapEvent(event, user.id);
    });
  }

  const event = await prisma.calendarEvent.create({
    data: {
      mentorshipId: mentorship.id,
      type,
      title: trimmedTitle,
      note: note ?? null,
      startsAt: startsAtDate,
      status: "SCHEDULED",
      createdById: user.id,
    },
    include: EVENT_INCLUDE,
  });
  return mapEvent(event, user.id);
}

async function loadOwnedScheduledEvent(mentorship, user, eventId) {
  const event = await prisma.calendarEvent.findUnique({ where: { id: eventId } });
  if (!event || event.mentorshipId !== mentorship.id) {
    throw makeError(404, "Calendar event not found");
  }
  if (event.createdById !== user.id) {
    throw makeError(403, "Only the creator can edit this");
  }
  return event;
}

export async function updateCalendarEvent(mentorship, user, eventId, { title, note, startsAt }) {
  const event = await loadOwnedScheduledEvent(mentorship, user, eventId);
  if (event.status !== "SCHEDULED") {
    throw makeError(409, "This event can no longer be edited");
  }
  if (title === undefined && note === undefined && startsAt === undefined) {
    throw makeError(400, "At least one field is required");
  }

  const data = {};
  if (title !== undefined) {
    const trimmedTitle = typeof title === "string" ? title.trim() : title;
    if (!isLengthBetween(trimmedTitle, 1, MAX_TITLE_LENGTH)) {
      throw makeError(400, `title must be 1 to ${MAX_TITLE_LENGTH} characters`);
    }
    data.title = trimmedTitle;
  }
  if (note !== undefined) {
    if (note != null && (typeof note !== "string" || note.length > MAX_NOTE_LENGTH)) {
      throw makeError(400, `note must be ${MAX_NOTE_LENGTH} characters or fewer`);
    }
    data.note = note;
  }
  if (startsAt !== undefined) {
    if (startsAt === null) {
      if (event.type !== "NOTE") {
        throw makeError(400, `startsAt is required for ${event.type} events`);
      }
      data.startsAt = null;
    } else {
      const unchanged =
        event.startsAt != null && new Date(startsAt).getTime() === event.startsAt.getTime();
      data.startsAt = unchanged ? event.startsAt : validateStartsAt(startsAt);
    }
  }

  const updated = await prisma.calendarEvent.update({
    where: { id: eventId },
    data,
    include: EVENT_INCLUDE,
  });
  return mapEvent(updated, user.id);
}

export async function cancelCalendarEvent(mentorship, user, eventId) {
  const event = await loadOwnedScheduledEvent(mentorship, user, eventId);
  if (event.status !== "SCHEDULED") {
    throw makeError(409, "This event has already been cancelled");
  }

  const updated = await prisma.calendarEvent.update({
    where: { id: eventId },
    data: { status: "CANCELLED" },
    include: EVENT_INCLUDE,
  });
  return mapEvent(updated, user.id);
}
