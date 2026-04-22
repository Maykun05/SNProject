import express from "express";
import multer from "multer";
import { FoodController } from "../controllers/foodController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", authMiddleware, FoodController.addFood);
router.get("/today", authMiddleware, FoodController.getFoodsToday);
router.get("/search", authMiddleware, FoodController.searchFoodByName);
router.post("/database/save", FoodController.saveFoodToDatabase);
router.post("/transcribe", upload.single("audio"), FoodController.transcribeAudio);
router.delete("/:id", authMiddleware, FoodController.deleteFood);

export default router;
