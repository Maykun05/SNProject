import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as waterController from "../controllers/waterController.js";

const router = express.Router();

router.get("/today", authMiddleware, waterController.getWaterToday);
router.get("/month", authMiddleware, waterController.getWaterMonth);
router.post("/log", authMiddleware, waterController.postWaterLog);
router.delete("/log/:id", authMiddleware, waterController.deleteWaterLog);

export default router;
