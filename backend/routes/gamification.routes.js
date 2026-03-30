// routes/gamification.routes.js
import express from "express";
import {
  getUserProgress,
  updateUserProgress,
  getAllProgress,
} from "../controllers/gamification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", getAllProgress);
router.get("/:id/progress", protectRoute, getUserProgress);
router.post("/:id/progress", protectRoute, updateUserProgress);

export default router;

