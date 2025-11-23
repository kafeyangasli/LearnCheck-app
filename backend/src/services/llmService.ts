import logger from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { LLMQuestion } from "../types";
import geminiService from "./geminiService";

class LLMService {
  async generateQuestions(
    content: string,
    difficulty: "easy" | "medium" | "hard" = "medium",
    count: number = 3,
  ): Promise<LLMQuestion[]> {
    try {
      // Use direct Gemini service instead of HTTP call
      const questions = await geminiService.generateQuestions(
        content,
        difficulty,
        count,
      );

      if (!questions || questions.length === 0) {
        throw new AppError("Failed to generate valid questions", 500);
      }

      return questions;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error generating questions: ${err.message}`);
      throw new AppError(err.message || "Failed to generate questions", 500);
    }
  }

  async generateFeedback(
    question: string,
    selectedAnswer: string,
    correctAnswer: string,
    isCorrect: boolean,
  ): Promise<string> {
    try {
      // Use direct Gemini service instead of HTTP call
      const feedback = await geminiService.generateFeedback(
        question,
        selectedAnswer,
        correctAnswer,
        isCorrect,
      );

      if (!feedback) {
        throw new AppError("Failed to generate feedback", 500);
      }

      return feedback;
    } catch (error) {
      const err = error as Error;
      logger.error(`Error generating feedback: ${err.message}`);
      throw new AppError(err.message || "Failed to generate feedback", 500);
    }
  }
}

export default new LLMService();
