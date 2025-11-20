import express from 'express';
import * as llmController from '../controllers/llmController';

const router = express.Router();

// POST /api/llm/generate-questions
router.post('/generate-questions', llmController.generateQuestions);

// POST /api/llm/generate-feedback
router.post('/generate-feedback', llmController.generateFeedback);

export default router;
