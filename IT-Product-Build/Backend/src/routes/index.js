import express from "express";
import authRoutes from "./auth.routes.js";
import helpRoutes from "./help.routes.js";
import menteeRoutes from "./mentee.routes.js";
import mentorRoutes from "./mentor.routes.js";
import mentorshipRoutes from "./mentorship.routes.js";
import mentorshipsRoutes from "./mentorships.routes.js";
import metaRoutes from "./meta.routes.js";
import pipelineStatsRoutes from "./pipelineStats.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/help", helpRoutes);
router.use("/mentee", menteeRoutes);
router.use("/mentor", mentorRoutes);
router.use("/mentorship", mentorshipRoutes);
router.use("/mentorships", mentorshipsRoutes);
router.use("/meta", metaRoutes);
router.use("/pipeline-stats", pipelineStatsRoutes);

export default router;
