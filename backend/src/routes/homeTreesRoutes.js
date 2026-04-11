import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getTreeCatalog, postUnlockTreeType } from "../controllers/homeGardenController.js";

const router = express.Router();

router.get("/trees/catalog", authMiddleware, getTreeCatalog);
router.post("/trees/unlock", authMiddleware, postUnlockTreeType);

export default router;
