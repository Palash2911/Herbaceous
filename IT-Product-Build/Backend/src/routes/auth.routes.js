import { Router } from "express";
import { me, signup, summary, updateMe } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/requireAuth.js";
import { signupRateLimit } from "../middleware/signupRateLimit.js";

const router = Router();

router.post("/signup", signupRateLimit, signup);
router.get("/me", requireAuth, me);
router.patch("/me", requireAuth, updateMe);
router.get("/summary", requireAuth, summary);

export default router;
