import express from "express";
import {
  registerUser,
  loginUser,
  checkAuth,
  logout,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
router.get("/check", protectRoute, checkAuth);
router.put("/update-profile", protectRoute, updateProfile);

export default router;
