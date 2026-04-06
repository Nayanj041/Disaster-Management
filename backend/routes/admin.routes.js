import express from "express";
import {
	getAdminStats,
	getRecentActivity,
	getAdminUsers,
	getProgressTrends,
	generateAnalyticsReport,
	getPreparednessIndex,
} from "../controllers/admin.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/stats", protectRoute, isAdmin, getAdminStats);
router.get("/activity", protectRoute, isAdmin, getRecentActivity);
router.get("/users", protectRoute, isAdmin, getAdminUsers);
router.get("/progress-trends", protectRoute, isAdmin, getProgressTrends);
router.get("/reports/generate", protectRoute, isAdmin, generateAnalyticsReport);
router.get("/preparedness-index", protectRoute, isAdmin, getPreparednessIndex);

export default router;