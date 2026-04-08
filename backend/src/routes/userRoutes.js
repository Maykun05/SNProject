import express from "express";
import { register, login, saveFeatures, updateProfile, getUserProfileController, getFeatures, getProfileStats, getFeatureIds, getTreeType, updateTreeType  } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// auth
router.post("/register", register);
router.post("/login", login);

// profile
router.get("/profile", authMiddleware, getUserProfileController);
router.put("/profile", authMiddleware, updateProfile);
router.get("/profile/stats", authMiddleware, getProfileStats);

// features
router.get("/features", authMiddleware, getFeatures);
router.post("/features", authMiddleware, saveFeatures);
router.get('/features/ids', authMiddleware, getFeatureIds);

router.get("/tree-type", authMiddleware, getTreeType);
router.put("/tree-type", authMiddleware, updateTreeType);

export default router;