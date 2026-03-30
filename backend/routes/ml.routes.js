import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  mlGamificationScore,
  mlPreparednessScore,
  mlRiskPrediction,
} from "../controllers/ml.controller.js";

const router = express.Router();

router.post("/risk-prediction", protectRoute, mlRiskPrediction);
router.post("/preparedness-score", protectRoute, mlPreparednessScore);
router.post("/gamification-score", protectRoute, mlGamificationScore);

export default router;
