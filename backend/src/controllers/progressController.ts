import { Request, Response } from 'express';
import progressService from '../services/progressService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

export const getProgress = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, tutorial_id } = req.params;

  logger.info(`Fetching progress for user ${user_id}, tutorial ${tutorial_id}`);

  const progress = await progressService.getProgress(user_id, tutorial_id);

  res.status(200).json({
    status: 'success',
    data: progress,
  });
});

export const saveProgress = asyncHandler(async (req: Request, res: Response) => {
  const { user_id, tutorial_id, attempt_data } = req.body;

  logger.info(`Saving progress for user ${user_id}, tutorial ${tutorial_id}`);

  const progress = await progressService.saveProgress(user_id, tutorial_id, attempt_data);

  res.status(201).json({
    status: 'success',
    message: 'Progress saved successfully',
    data: progress,
  });
});
