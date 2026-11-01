import { Router } from "express";
import {
  checkVerificationRequest,
  createToleranceEvent,
  endMentorship,
  getMenteeDetail,
  getOverview,
  getProfile,
  getVerificationStatus,
  listAdvocacyInbox,
  listMentees,
  listRequests,
  respondToAdvocacyRequest,
  respondToPauseRequest,
  respondToRequest,
  updateOnboarding,
  updateProfile,
  uploadVerificationFiles,
  verify,
  warmupVerification,
} from "../controllers/mentor.controller.js";
import { loadMentorContext } from "../middleware/loadMentorContext.js";
import {
  loadMentorshipParticipant,
  requireMentorSide,
  requireOpenMentorship,
} from "../middleware/loadMentorshipParticipant.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireCredentialVerification } from "../middleware/requireCredentialVerification.js";
import { verificationRateLimit } from "../middleware/verificationRateLimit.js";
import { verificationWarmupRateLimit } from "../middleware/verificationWarmupRateLimit.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.use(requireAuth, requireRole("MENTOR"), loadMentorContext);

router.get("/verification", getVerificationStatus);
router.get(
  "/verification/warmup",
  verificationWarmupRateLimit,
  warmupVerification,
);
router.post(
  "/verification",
  requireCredentialVerification,
  uploadVerificationFiles,
  checkVerificationRequest,
  verificationRateLimit,
  verify,
);
router.put("/onboarding", updateOnboarding);
router.get("/profile", getProfile);
router.patch("/profile", updateProfile);
router.get("/overview", getOverview);
router.get("/mentees", listMentees);
router.use("/mentees/:mentorshipId", loadMentorshipParticipant, requireMentorSide);
router.get("/mentees/:mentorshipId", getMenteeDetail);
router.put(
  "/mentees/:mentorshipId/pause-requests/:requestId",
  requireOpenMentorship,
  respondToPauseRequest,
);
router.put(
  "/mentees/:mentorshipId/advocacy-requests/:requestId",
  requireOpenMentorship,
  respondToAdvocacyRequest,
);
router.post(
  "/mentees/:mentorshipId/tolerance",
  requireOpenMentorship,
  createToleranceEvent,
);
router.post(
  "/mentees/:mentorshipId/end",
  requireOpenMentorship,
  endMentorship,
);
router.get("/advocacy-requests", listAdvocacyInbox);
router.get("/requests", listRequests);
router.put("/requests/:id", respondToRequest);

export default router;
