import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getTreeCatalog,
  postUnlockTreeType,
  getTreeInventory,
  getHomeGardenLayout,
  putHomeGardenLayout,
} from "../controllers/homeGardenController.js";

const router = express.Router();

router.get("/trees/catalog", authMiddleware, getTreeCatalog);
router.post("/trees/unlock", authMiddleware, postUnlockTreeType);
router.get("/trees/inventory", authMiddleware, getTreeInventory);
router.get("/home-layout", authMiddleware, getHomeGardenLayout);
router.put("/home-layout", authMiddleware, putHomeGardenLayout);

export default router;
