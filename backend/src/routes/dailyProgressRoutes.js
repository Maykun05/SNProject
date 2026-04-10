import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getGardenMonth,
  logFeature,
  getTodayProgress,
  selectFeatures,
  getGardenSummary,
} from "../controllers/dailyProgressController.js";

const router = express.Router();

router.get("/month", authMiddleware, getGardenMonth);
router.post("/log", authMiddleware, logFeature);
router.get("/today", authMiddleware, getTodayProgress);
router.post("/features/select", authMiddleware, selectFeatures);
router.get("/summary", authMiddleware, getGardenSummary);

export default router;
