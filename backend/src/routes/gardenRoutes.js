import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getGardenMonth,
  logFeature,
  getTodayProgress,
  selectFeatures,
  getGardenSummary,
} from "../controllers/gardenController.js";
import {
  getTreeCatalog,
  postUnlockTreeType,
  getTreeInventory,
  getHomeGardenLayout,
  putHomeGardenLayout,
} from "../controllers/homeGardenController.js";

const router = express.Router();

router.get("/month", authMiddleware, getGardenMonth);
router.post("/log", authMiddleware, logFeature);
router.get("/today", authMiddleware, getTodayProgress);
router.post("/features/select", authMiddleware, selectFeatures);
router.get("/summary", authMiddleware, getGardenSummary);

// Home garden: catalog + coin unlock + inventory + drag-drop layout (layout length = homeSlotCount)
router.get("/trees/catalog", authMiddleware, getTreeCatalog);
router.post("/trees/unlock", authMiddleware, postUnlockTreeType);
router.get("/trees/inventory", authMiddleware, getTreeInventory);
router.get("/home-layout", authMiddleware, getHomeGardenLayout);
router.put("/home-layout", authMiddleware, putHomeGardenLayout);

// Backward-compatible aliases for older mobile paths.
router.post("/log-feature", authMiddleware, logFeature);
router.get("/today-progress", authMiddleware, getTodayProgress);
router.put("/select-features", authMiddleware, selectFeatures);

export default router;