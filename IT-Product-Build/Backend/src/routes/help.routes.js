import { Router } from "express";
import { createHelpTicket } from "../controllers/help.controller.js";
import { helpTicketRateLimit } from "../middleware/helpTicketRateLimit.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";

const router = Router();

router.use(requireAuth, requireRole("MENTEE", "MENTOR"));

router.post("/tickets", helpTicketRateLimit, createHelpTicket);

export default router;
