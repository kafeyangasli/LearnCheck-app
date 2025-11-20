import { Request, Response } from 'express';
import geminiService from '../services/geminiService';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import logger from '../config/logger';

export const generateQuestions = asyncHandler(async (req: Request, res: Response) => {
  const { content, difficulty = 'medium', count = 3 } = req.body;

  if (!content) {
    throw new AppError('Content is required', 400);
  }

  if (count < 1 || count > 10) {
    throw new AppError('Count must be between 1 and 10', 400);
  }

  const validDifficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
  if (!validDifficulties.includes(difficulty)) {
    throw new AppError('Difficulty must be one of: easy, medium, hard', 400);
  }

  logger.info(`Generating ${count} questions with difficulty: ${difficulty}`);

  const questions = await geminiService.generateQuestions(content, difficulty, count);

  res.status(200).json({
    status: 'success',
    data: {
      questions,
      count: questions.length,
      difficulty,
    },
  });
});

export const generateFeedback = asyncHandler(async (req: Request, res: Response) => {
  const { question, selectedAnswer, correctAnswer, isCorrect } = req.body;

  if (!question) {
    throw new AppError('Question is required', 400);
  }

  if (!selectedAnswer) {
    throw new AppError('Selected answer is required', 400);
  }

  if (!correctAnswer) {
    throw new AppError('Correct answer is required', 400);
  }

  if (isCorrect === undefined) {
    throw new AppError('isCorrect is required', 400);
  }

  logger.info(`Generating feedback for question, isCorrect: ${isCorrect}`);

  const feedback = await geminiService.generateFeedback(
    question,
    selectedAnswer,
    correctAnswer,
    isCorrect
  );

  res.status(200).json({
    status: 'success',
    data: {
      feedback,
      isCorrect,
    },
  });
});
