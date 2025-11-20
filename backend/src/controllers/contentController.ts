import { Request, Response } from 'express';
import dicodingService from '../services/dicodingService';
import { asyncHandler } from '../middleware/errorHandler';
import logger from '../config/logger';

export const getTutorialContent = asyncHandler(async (req: Request, res: Response) => {
  const { tutorial_id } = req.params;

  logger.info(`Fetching content for tutorial ${tutorial_id}`);

  const content = await dicodingService.getTutorialContent(tutorial_id);

  res.status(200).json({
    status: 'success',
    data: content,
  });
});
