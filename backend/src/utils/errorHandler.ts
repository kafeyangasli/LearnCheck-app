import { Request, Response, NextFunction } from "express";
import logger from "../config/logger";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger.error("[ErrorHandler] An error occurred:", err);
  res.status(500).json({
    status: "error",
    message: "Internal Server Error",
  });
};
