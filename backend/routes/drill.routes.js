import express from "express";
import {
  createDrill,
  updateDrillStatus,
  getUserDrills,
  completeDrill,
  getAllDrills,
  updateDrill,
  deleteDrill,
} from "../controllers/drill.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getAllDrills);
router.post("/", protectRoute, createDrill);
router.put("/:drillId", protectRoute, updateDrill);
router.delete("/:drillId", protectRoute, deleteDrill);
router.put("/:drillId/status", protectRoute, updateDrillStatus);
router.get("/user/:userId", protectRoute, getUserDrills);
router.post("/complete", protectRoute, completeDrill);

export default router;
