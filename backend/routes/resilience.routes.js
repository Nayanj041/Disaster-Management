import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/authorizeRoles.js";
import {
  createIncidentReport,
  listIncidentReports,
  updateIncidentVerification,
  getAlertPreferences,
  updateAlertPreferences,
  getNotificationPreview,
  getEvacuationRecommendations,
  getPreparednessChecklist,
  toggleChecklistItem,
  listResources,
  translateText,
  getForecast,
  getDrillReplay,
  listVolunteerTasks,
  createVolunteerTask,
  updateVolunteerTask,
  getOfflinePack,
  triggerSos,
} from "../controllers/resilience.controller.js";

const router = express.Router();

router.post("/incidents", protectRoute, createIncidentReport);
router.get("/incidents", protectRoute, listIncidentReports);
router.patch(
  "/incidents/:id/verification",
  protectRoute,
  authorizeRoles("teacher", "admin"),
  updateIncidentVerification
);

router.get("/alert-preferences", protectRoute, getAlertPreferences);
router.put("/alert-preferences", protectRoute, updateAlertPreferences);
router.get("/notifications/preview", protectRoute, getNotificationPreview);

router.post("/evacuation/recommendations", protectRoute, getEvacuationRecommendations);

router.get("/checklist", protectRoute, getPreparednessChecklist);
router.post("/checklist/:key/toggle", protectRoute, toggleChecklistItem);

router.get("/resources", protectRoute, listResources);
router.get("/translate", protectRoute, translateText);
router.get("/forecast", protectRoute, authorizeRoles("teacher", "admin"), getForecast);

router.get(
  "/drill-replay/:id",
  protectRoute,
  authorizeRoles("teacher", "admin"),
  getDrillReplay
);

router.get("/volunteer-tasks", protectRoute, listVolunteerTasks);
router.post(
  "/volunteer-tasks",
  protectRoute,
  authorizeRoles("teacher", "admin"),
  createVolunteerTask
);
router.patch(
  "/volunteer-tasks/:id",
  protectRoute,
  authorizeRoles("teacher", "admin"),
  updateVolunteerTask
);

router.get("/offline-pack", protectRoute, getOfflinePack);
router.post("/sos", protectRoute, triggerSos);

export default router;
