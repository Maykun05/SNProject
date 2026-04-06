import express from 'express';
import { saveStepSession, getStepHistory } from '../controllers/stepController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/steps', authMiddleware, saveStepSession);
router.get('/steps', authMiddleware, getStepHistory);

export default router;