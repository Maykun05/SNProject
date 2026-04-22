import express from "express";
import { FoodController } from "../controllers/foodController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, FoodController.addFood);
router.get("/today", authMiddleware, FoodController.getFoodsToday);
router.get("/search", authMiddleware, FoodController.searchFoodByName);
router.post("/database/save", FoodController.saveFoodToDatabase);
router.delete("/:id", authMiddleware, FoodController.deleteFood);

export default router;
