import express from "express";
import {
  createReport,
  getAllReports,
} from "../controllers/report.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/isAdmin.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";

const router = express.Router();

router.post(
  "/create",
  protectRoute,
  authorizeRoles("student", "teacher"),
  createReport
);

router.get("/all", protectRoute, isAdmin, getAllReports);

export default router;
