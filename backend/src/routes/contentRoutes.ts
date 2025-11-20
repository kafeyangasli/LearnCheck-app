import express from 'express';
import * as contentController from '../controllers/contentController';

const router = express.Router();

// GET /api/content/:tutorial_id
router.get('/:tutorial_id', contentController.getTutorialContent);

export default router;
