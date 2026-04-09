import express from 'express';
import { logCalorie, getTodayCalories } from '../controllers/calorieController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; // ✅ import ถูกแล้ว

const router = express.Router();
router.post('/', authMiddleware, logCalorie);      // แก้ protect → authMiddleware
router.get('/today', authMiddleware, getTodayCalories); // แก้ protect → authMiddleware

export default router;