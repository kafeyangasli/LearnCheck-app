import express from 'express';
import * as questionController from '../controllers/questionController';
import { validateQuestionGeneration, validateAnswerSubmission } from '../middleware/validator';

const router = express.Router();

// POST /api/questions/generate
router.post('/generate', validateQuestionGeneration, questionController.generateQuestions);

// POST /api/answers/submit
router.post('/submit', validateAnswerSubmission, questionController.submitAnswer);

export default router;
