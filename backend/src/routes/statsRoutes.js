import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getFeatureStats7d } from "../controllers/statsController.js";

const router = express.Router();

router.get("/feature-7d", authMiddleware, getFeatureStats7d);

export default router;
