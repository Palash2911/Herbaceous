import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { SPECIALISMS } from "../services/matching/specialisms.js";

const router = Router();

router.get("/specialisms", requireAuth, (req, res) => {
  res.json(SPECIALISMS.map((specialism) => specialism.label));
});

export default router;
