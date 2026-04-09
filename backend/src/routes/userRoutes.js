import express from "express";
import * as userController from '../controllers/userController.js';
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// auth
router.post("/register", userController.register);
router.post("/login", userController.login);

router.get('/user', authMiddleware, userController.getUserController);
router.put('/user', authMiddleware, userController.updateUserController);

// profile
router.get("/profile", authMiddleware, userController.getProfileController);
router.put("/profile", authMiddleware, userController.updateProfileController);
router.get("/profile/stats", authMiddleware, userController.getProfileStats);

// features
router.get("/features", authMiddleware, userController.getFeatures);
router.post("/features", authMiddleware, userController.saveFeatures);
router.get('/features/ids', authMiddleware, userController.getFeatureIds);

router.get("/tree-type", authMiddleware, userController.getTreeType);
router.put("/tree-type", authMiddleware, userController.updateTreeType);

router.get("/user/profile", authMiddleware, userController.getUserProfileController);

export default router;