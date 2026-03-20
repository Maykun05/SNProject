import express from "express";
import {setMood, getMoodByMonth, getTodayMood } from "../controllers/moodController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, setMood);
router.get("/month", authMiddleware, getMoodByMonth);
router.get("/today", authMiddleware, getTodayMood);

export default router;