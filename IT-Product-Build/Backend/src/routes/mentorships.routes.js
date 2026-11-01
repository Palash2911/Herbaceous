import { Router } from "express";
import {
  cancelCalendarEvent,
  createCalendarEvent,
  createMeetingLink,
  getChatRoom,
  listCalendarEvents,
  listMeetingLinks,
  updateCalendarEvent,
  updateChatRoom,
} from "../controllers/mentorships.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  loadMentorshipParticipant,
  requireOpenMentorship,
} from "../middleware/loadMentorshipParticipant.js";

const router = Router();

router.use(
  "/:mentorshipId",
  requireAuth,
  requireRole("MENTEE", "MENTOR"),
  loadMentorshipParticipant,
);

router.get("/:mentorshipId/chat-room", getChatRoom);
router.put("/:mentorshipId/chat-room", requireOpenMentorship, updateChatRoom);

router.get("/:mentorshipId/meeting-links", listMeetingLinks);
router.post("/:mentorshipId/meeting-links", requireOpenMentorship, createMeetingLink);

router.get("/:mentorshipId/calendar", listCalendarEvents);
router.post("/:mentorshipId/calendar", requireOpenMentorship, createCalendarEvent);
router.patch(
  "/:mentorshipId/calendar/:eventId",
  requireOpenMentorship,
  updateCalendarEvent,
);
router.patch(
  "/:mentorshipId/calendar/:eventId/cancel",
  requireOpenMentorship,
  cancelCalendarEvent,
);

export default router;
