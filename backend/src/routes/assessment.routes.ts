
import { Router } from 'express';
import { getAssessment, getUserPrefs, prepareAssessment } from '../controllers/assessment.controller';

const router = Router();

// GET /api/v1/preferences?user_id=xxx - Get user preferences only
router.get('/preferences', getUserPrefs);

// POST /api/v1/assessment/prepare - Trigger background quiz generation (non-blocking)
router.post('/assessment/prepare', prepareAssessment);

// GET /api/v1/assessment?tutorial_id=xxx&user_id=xxx - Get 3 random questions from pool
router.get('/assessment', getAssessment);

export default router;
