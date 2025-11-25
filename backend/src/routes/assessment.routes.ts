import { Router } from 'express';
import {
    getUserPrefs,
    getAssessment,
    prepareAssessment,
} from '../controllers/assessment.controller';

const router = Router();

router.get('/preferences', getUserPrefs);

router.post('/assessment/prepare', prepareAssessment);

router.get('/assessment', getAssessment);

export default router;
