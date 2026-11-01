import { Router } from "express";
import {
  createRequest,
  getMentorship,
  getOverview,
  getProfile,
  getTolerance,
  listRequests,
  startNow,
  updateOnboarding,
  updateProfile,
  withdrawRequest,
} from "../controllers/mentee.controller.js";
import {
  getMentorDetail,
  listMentors,
} from "../controllers/menteeMatching.controller.js";
import {
  createPauseRequest,
  createWeeklyLog,
  listPauseRequests,
  listWeeklyLogs,
  updateWeeklyLog,
  withdrawPauseRequest,
} from "../controllers/menteeJourney.controller.js";
import {
  createAdvocacyRequest,
  listAdvocacyRequests,
  withdrawAdvocacyRequest,
} from "../controllers/menteeAdvocacy.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  loadMenteeContext,
  requireActiveMentorship,
} from "../middleware/loadMenteeContext.js";

const router = Router();

router.use(requireAuth, requireRole("MENTEE"), loadMenteeContext);

router.put("/onboarding", updateOnboarding);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);

router.get("/mentors", listMentors);
router.get("/mentors/:id", getMentorDetail);

router.post("/requests", createRequest);
router.get("/requests", listRequests);
router.patch("/requests/:id/withdraw", withdrawRequest);
router.post("/requests/:id/start-now", startNow);

router.get("/mentorship", getMentorship);
router.get("/overview", getOverview);

router.get("/weekly-logs", listWeeklyLogs);
router.post("/weekly-logs", requireActiveMentorship, createWeeklyLog);
router.patch("/weekly-logs/:id", requireActiveMentorship, updateWeeklyLog);

router.post("/pause-requests", requireActiveMentorship, createPauseRequest);
router.get("/pause-requests", listPauseRequests);
router.patch(
  "/pause-requests/:id/withdraw",
  requireActiveMentorship,
  withdrawPauseRequest,
);

router.get("/advocacy-requests", listAdvocacyRequests);
router.post("/advocacy-requests", requireActiveMentorship, createAdvocacyRequest);
router.patch(
  "/advocacy-requests/:id/withdraw",
  requireActiveMentorship,
  withdrawAdvocacyRequest,
);

router.get("/tolerance", getTolerance);

export default router;
