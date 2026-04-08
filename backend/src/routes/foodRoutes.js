import express from "express";
import { FoodController } from "../controllers/foodController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, FoodController.addFood);
router.get("/today", authMiddleware, FoodController.getFoodsToday);
router.delete("/:id", authMiddleware, FoodController.deleteFood);

export default router;
