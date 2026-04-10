import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import * as missionController from "../controllers/missionController.js";

const router = express.Router();

router.get("/missions/sync", authMiddleware, missionController.getMissionsSync);

export default router;
