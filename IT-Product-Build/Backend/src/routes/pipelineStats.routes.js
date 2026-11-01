import { Router } from "express";
import {
  getAllStats,
  getStatsBySection,
} from "../controllers/pipelineStats.controller.js";

const router = Router();

router.get("/", getAllStats);
router.get("/:section", getStatsBySection);

export default router;
