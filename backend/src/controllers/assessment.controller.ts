import { Request, Response, NextFunction } from 'express';
import { fetchAssessmentData, fetchUserPreferences, triggerBackgroundGeneration } from '../services/assessment.service';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

export const getUserPrefs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { user_id } = req.query;

    if (!user_id || typeof user_id !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_USER_ID
      });
    }

    const userPreferences = await fetchUserPreferences(user_id);
    res.status(HTTP_STATUS.OK).json({ userPreferences });
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tutorial_id, user_id, fresh } = req.query;

    if (!tutorial_id || typeof tutorial_id !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_TUTORIAL_ID
      });
    }

    if (!user_id || typeof user_id !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_USER_ID
      });
    }

    const skipCache = fresh === 'true';

    const assessmentData = await fetchAssessmentData(tutorial_id, user_id, skipCache);
    res.status(HTTP_STATUS.OK).json(assessmentData);
  } catch (error) {
    next(error);
  }
};

export const prepareAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tutorial_id } = req.body;

    if (!tutorial_id || typeof tutorial_id !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_TUTORIAL_ID
      });
    }

    await triggerBackgroundGeneration(tutorial_id);

    res.status(HTTP_STATUS.ACCEPTED).json({
      message: 'Quiz generation started in background',
      tutorial_id
    });
  } catch (error) {
    next(error);
  }
};
