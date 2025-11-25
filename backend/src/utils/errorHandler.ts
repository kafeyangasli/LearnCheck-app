
import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!', message: err.message });
};
