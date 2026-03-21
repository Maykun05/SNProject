import express from "express";
import { register, login, getUser, saveFeatures, updateProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/profile", authMiddleware, updateProfile);
router.post("/features", authMiddleware, saveFeatures);
router.get("/getUsers", authMiddleware, getUser);

export default router;