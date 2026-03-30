import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  assessRisk,
  getDrillParticipationAnalytics,
  getRegionalRiskMap,
  getRiskHistory,
} from "../controllers/risk.controller.js";

const router = express.Router();

router.post("/assess", protectRoute, assessRisk);
router.get("/history", protectRoute, getRiskHistory);
router.get("/region-map", protectRoute, getRegionalRiskMap);
router.get("/drill-analytics", protectRoute, getDrillParticipationAnalytics);

export default router;
