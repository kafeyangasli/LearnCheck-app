import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorHandler";

export const validateQuestionGeneration = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const { tutorial_id, user_id, attempt_number } = req.body;

  if (!tutorial_id) {
    return next(new AppError("tutorial_id is required", 400));
  }

  if (!user_id) {
    return next(new AppError("user_id is required", 400));
  }

  if (attempt_number === undefined || attempt_number < 1) {
    return next(new AppError("attempt_number must be a positive integer", 400));
  }

  next();
};

export const validateAnswerSubmission = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const { question_id, selected_answer, user_id } = req.body;

  if (!question_id) {
    return next(new AppError("question_id is required", 400));
  }

  if (
    selected_answer === undefined ||
    selected_answer < 0 ||
    selected_answer > 3
  ) {
    return next(new AppError("selected_answer must be between 0 and 3", 400));
  }

  if (!user_id) {
    return next(new AppError("user_id is required", 400));
  }

  next();
};

export const validateProgressSave = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const { user_id, tutorial_id, attempt_data } = req.body;

  if (!user_id) {
    return next(new AppError("user_id is required", 400));
  }

  if (!tutorial_id) {
    return next(new AppError("tutorial_id is required", 400));
  }

  if (!attempt_data) {
    return next(new AppError("attempt_data is required", 400));
  }

  if (!attempt_data.timestamp) {
    return next(new AppError("attempt_data.timestamp is required", 400));
  }

  if (attempt_data.score === undefined) {
    return next(new AppError("attempt_data.score is required", 400));
  }

  next();
};
