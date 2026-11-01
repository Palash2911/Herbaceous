import * as chatRoomService from "../services/chatRoomService.js";
import * as meetingLinkService from "../services/meetingLinkService.js";
import * as calendarService from "../services/calendarService.js";

export async function getChatRoom(req, res, next) {
  try {
    const result = await chatRoomService.getChatRoom(req.participant.mentorship);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function updateChatRoom(req, res, next) {
  try {
    const { url } = req.body;
    if (url !== null && typeof url !== "string") {
      return res.status(400).json({ message: "url must be a string or null" });
    }

    const result = await chatRoomService.updateChatRoom(
      req.participant.mentorship,
      req.participant.user,
      url,
    );
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function listMeetingLinks(req, res, next) {
  try {
    const links = await meetingLinkService.listMeetingLinks(
      req.participant.mentorship,
      req.participant.user.id,
    );
    res.json(links);
  } catch (err) {
    next(err);
  }
}

export async function createMeetingLink(req, res, next) {
  try {
    const { url, label } = req.body;
    const link = await meetingLinkService.createMeetingLink(
      req.participant.mentorship,
      req.participant.user,
      { url, label },
    );
    res.status(201).json(link);
  } catch (err) {
    next(err);
  }
}

function parseIncludeCancelled(raw) {
  if (raw == null) return false;
  if (raw === "true") return true;
  if (raw === "false") return false;
  return "invalid";
}

export async function listCalendarEvents(req, res, next) {
  try {
    const { from, to, includeCancelled: includeCancelledRaw } = req.query;

    const includeCancelled = parseIncludeCancelled(includeCancelledRaw);
    if (includeCancelled === "invalid") {
      return res.status(400).json({ message: "includeCancelled must be true or false" });
    }

    const events = await calendarService.listCalendarEvents(
      req.participant.mentorship,
      req.participant.user.id,
      { from, to, includeCancelled },
    );
    res.json(events);
  } catch (err) {
    next(err);
  }
}

export async function createCalendarEvent(req, res, next) {
  try {
    const event = await calendarService.createCalendarEvent(
      req.participant.mentorship,
      req.participant.user,
      req.body,
    );
    res.status(201).json(event);
  } catch (err) {
    next(err);
  }
}

export async function updateCalendarEvent(req, res, next) {
  try {
    const { title, note, startsAt } = req.body;
    const event = await calendarService.updateCalendarEvent(
      req.participant.mentorship,
      req.participant.user,
      req.params.eventId,
      { title, note, startsAt },
    );
    res.json(event);
  } catch (err) {
    next(err);
  }
}

export async function cancelCalendarEvent(req, res, next) {
  try {
    const event = await calendarService.cancelCalendarEvent(
      req.participant.mentorship,
      req.participant.user,
      req.params.eventId,
    );
    res.json(event);
  } catch (err) {
    next(err);
  }
}
