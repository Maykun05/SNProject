import express from "express";
import {setMood, getMoodByMonth, getTodayMood } from "../controllers/moodController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/mood", authMiddleware, setMood);
router.get("/mood/month", authMiddleware, getMoodByMonth);
router.get("/mood/today", authMiddleware, getTodayMood);

export default router;