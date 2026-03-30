import express from "express";
import {
  createModule,
  getModuleById,
  getModules,
  submitModuleQuiz,
  updateModuleProgress,
} from "../controllers/module.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/isAdmin.js";

const router = express.Router();

router.get("/", protectRoute, getModules);
router.get("/:id", protectRoute, getModuleById);
router.put("/:id/progress", protectRoute, updateModuleProgress);
router.post("/:id/quiz", protectRoute, submitModuleQuiz);
router.post("/", protectRoute, isAdmin, createModule);

export default router;