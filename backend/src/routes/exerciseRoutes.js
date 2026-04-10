import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getExerciseDayController,
  putExerciseDayController,
} from "../controllers/exerciseController.js";

const router = express.Router();

router.get("/day", authMiddleware, getExerciseDayController);
router.put("/day", authMiddleware, putExerciseDayController);

export default router;
