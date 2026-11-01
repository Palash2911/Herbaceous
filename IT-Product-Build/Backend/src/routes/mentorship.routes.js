import { Router } from "express";
import { getCurrent } from "../controllers/mentorship.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();

router.get("/current", requireAuth, getCurrent);

export default router;
