import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import {
  fetchUserPreferences,
  getJobResult,
  addAssessmentJob,
  getCachedAssessment,
  getActiveSession,
  clearActiveSession,
} from "../services/assessment.service";
import { ERROR_MESSAGES, HTTP_STATUS } from "../config/constants";

const IdSchema = z
  .string()
  .regex(/^[a-zA-Z0-9-_]+$/, {
    message:
      "ID must only contain alphanumeric characters, hyphens, or underscores",
  })
  .min(1)
  .max(50)
  .refine((val) => val.toLowerCase() !== "admin", {
    message: "ID 'admin' is not allowed",
  });

export const getUserPrefs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { user_id } = req.query;
    const validationResult = IdSchema.safeParse(user_id);

    if (!validationResult.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_USER_ID,
        details: validationResult.error.issues,
      });
    }

    const validUserId = validationResult.data;
    const userPreferences = await fetchUserPreferences(validUserId);

    res.status(HTTP_STATUS.OK).json({ userPreferences });
  } catch (error) {
    next(error);
  }
};

export const getAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tutorial_id, user_id, fresh, new_session } = req.query;
    const tutorialIdValidation = IdSchema.safeParse(tutorial_id);
    const userIdValidation = IdSchema.safeParse(user_id);

    if (!tutorialIdValidation.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_TUTORIAL_ID,
        details: tutorialIdValidation.error.issues,
      });
    }

    if (!userIdValidation.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_USER_ID,
        details: userIdValidation.error.issues,
      });
    }

    const validTutorialId = tutorialIdValidation.data;
    const validUserId = userIdValidation.data;
    const skipCache = fresh === "true";
    const isNewSession = new_session === "true";
    const jobId = `${validUserId}-${validTutorialId}`;

    if (isNewSession) {
      await clearActiveSession(validTutorialId, validUserId);
    }

    if (!isNewSession) {
      const activeSession = await getActiveSession(
        validTutorialId,
        validUserId,
      );
      if (activeSession) {
        return res.status(HTTP_STATUS.OK).json(activeSession);
      }
    }

    if (!skipCache) {
      const cachedAssessment = await getCachedAssessment(
        validTutorialId,
        validUserId,
      );

      if (cachedAssessment) {
        return res.status(HTTP_STATUS.OK).json(cachedAssessment);
      }
    }

    const jobResult = await getJobResult(validTutorialId, validUserId);

    if (jobResult) {
      if (jobResult.status === "completed") {
        return res.status(HTTP_STATUS.OK).json(jobResult.data);
      }

      if (jobResult.status === "failed") {
        return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
          error: "Quiz generation failed",
          message: "An unexpected error occurred during quiz generation",
          canRetry: true,
        });
      }
    }

    await addAssessmentJob(validTutorialId, validUserId, skipCache, jobId);

    return res.status(HTTP_STATUS.ACCEPTED).json({
      status: "accepted",
      message: "Quiz generation started. Please poll this endpoint.",
      jobId,
      tutorialId: validTutorialId,
      userId: validUserId,
    });
  } catch (error) {
    next(error);
  }
};

export const prepareAssessment = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { tutorial_id } = req.body;
    const tutorialIdValidation = IdSchema.safeParse(tutorial_id);

    if (!tutorialIdValidation.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        error: ERROR_MESSAGES.INVALID_TUTORIAL_ID,
        details: tutorialIdValidation.error.issues,
      });
    }

    const validTutorialId = tutorialIdValidation.data;
    const placeholderUserId = "system-pregenerate";

    await addAssessmentJob(
      validTutorialId,
      placeholderUserId,
      false,
      `pregenerate-${validTutorialId}`,
    );
    res.status(HTTP_STATUS.ACCEPTED).json({
      message: "Quiz generation started in background",
      tutorial_id: validTutorialId,
    });
  } catch (error) {
    next(error);
  }
};
