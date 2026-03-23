import express from "express";
import { saveSleepController, getSleepController } from "../controllers/sleepController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, saveSleepController);
router.get("/", authMiddleware, getSleepController);

export default router;
