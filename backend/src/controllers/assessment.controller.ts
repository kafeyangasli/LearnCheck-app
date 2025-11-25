import { Request, Response, NextFunction } from 'express';
import { fetchAssessmentData, fetchUserPreferences, triggerBackgroundGeneration } from '../services/assessment.service';
import { ERROR_MESSAGES, HTTP_STATUS } from '../config/constants';

/**
 * Get user preferences endpoint
 * @route GET /api/v1/preferences
 * @query user_id - User identifier
 */
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

/**
 * Generate or fetch cached assessment endpoint
 * @route GET /api/v1/assessment
 * @query tutorial_id - Tutorial identifier
 * @query user_id - User identifier
 * @query fresh - Optional: 'true' to skip cache and generate new questions (for retries)
 */
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

    // Parse 'fresh' parameter (for retry attempts to get new questions)
    const skipCache = fresh === 'true';
    
    const assessmentData = await fetchAssessmentData(tutorial_id, user_id, skipCache);
    res.status(HTTP_STATUS.OK).json(assessmentData);
  } catch (error) {
    next(error);
  }
};

/**
 * Trigger background quiz generation (non-blocking)
 * @route POST /api/v1/assessment/prepare
 * @body tutorial_id - Tutorial identifier
 */
export const prepareAssessment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tutorial_id } = req.body;

    if (!tutorial_id || typeof tutorial_id !== 'string') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({ 
        error: ERROR_MESSAGES.INVALID_TUTORIAL_ID 
      });
    }

    // Trigger background generation (non-blocking)
    await triggerBackgroundGeneration(tutorial_id);
    
    // Return immediately
    res.status(HTTP_STATUS.ACCEPTED).json({ 
      message: 'Quiz generation started in background',
      tutorial_id 
    });
  } catch (error) {
    next(error);
  }
};
