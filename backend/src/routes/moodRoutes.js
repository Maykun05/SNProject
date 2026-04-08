import express from "express";
import {
    createOrUpdateMood, 
    getMoodsByMonth, 
    getTodayMood 
} from "../controllers/moodController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/month", authMiddleware, getMoodsByMonth);
router.get("/today", authMiddleware, getTodayMood);
router.post("/", authMiddleware, createOrUpdateMood);

export default router;