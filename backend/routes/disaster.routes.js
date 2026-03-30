import express from "express";
import {
  getAllDisasters,
  createDisaster,
} from "../controllers/disaster.controller.js";

const router = express.Router();

router.get("/", getAllDisasters);
router.post("/", createDisaster);

export default router;
