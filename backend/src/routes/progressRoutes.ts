import express from 'express';
import * as progressController from '../controllers/progressController';
import { validateProgressSave } from '../middleware/validator';

const router = express.Router();

// GET /api/progress/:user_id/:tutorial_id
router.get('/:user_id/:tutorial_id', progressController.getProgress);

// POST /api/progress/save
router.post('/save', validateProgressSave, progressController.saveProgress);

export default router;
