
import { Router } from 'express';
import assessmentRouter from './assessment.routes';

const router = Router();

// Mount assessment routes (includes /preferences and /assessment)
router.use('/', assessmentRouter);

export default router;
