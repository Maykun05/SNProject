import express from 'express';
import {
  saveActivitySession,
  getActivitySessionHistory,
  getLatestActivitySessionForInstance,
} from '../controllers/activitySessionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/activity-sessions', authMiddleware, saveActivitySession);
router.get('/activity-sessions/latest', authMiddleware, getLatestActivitySessionForInstance);
router.get('/activity-sessions', authMiddleware, getActivitySessionHistory);

export default router;
