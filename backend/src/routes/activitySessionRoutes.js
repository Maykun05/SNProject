import express from 'express';
import {
  saveActivitySession,
  getActivitySessionHistory,
} from '../controllers/activitySessionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/activity-sessions', authMiddleware, saveActivitySession);
router.get('/activity-sessions', authMiddleware, getActivitySessionHistory);

export default router;
