import dicodingService from "./dicodingService";
import llmService from "./llmService";
import { getCachedData, setCachedData } from "../config/redis";
import logger from "../config/logger";
import { AppError } from "../middleware/errorHandler";
import { QuestionWithMetadata, AnswerValidationResult } from "../types";

class QuestionService {
  private questions: Map<string, QuestionWithMetadata>;

  constructor() {
    this.questions = new Map<string, QuestionWithMetadata>();
  }

  async generateQuestions(
    tutorialId: string,
    userId: string,
    attemptNumber: number,
  ): Promise<QuestionWithMetadata[]> {
    try {
      // Create cache key
      const cacheKey = `tutorial:${tutorialId}:attempt:${attemptNumber}:user:${userId}`;

      // Check cache first
      const cachedQuestions =
        await getCachedData<QuestionWithMetadata[]>(cacheKey);
      if (cachedQuestions) {
        logger.info(`Returning cached questions for key: ${cacheKey}`);

        // Store in memory for answer validation
        cachedQuestions.forEach((q) => {
          this.questions.set(q.question_id, q);
        });

        return cachedQuestions;
      }

      // Fetch tutorial content from Mock Dicoding API
      const tutorialData = await dicodingService.getTutorialContent(tutorialId);

      // Determine difficulty based on attempt number
      const difficulty = this.calculateDifficulty(attemptNumber);

      // Generate questions using LLM service
      const questions = await llmService.generateQuestions(
        tutorialData.content,
        difficulty,
        3,
      );

      // Add metadata to questions
      const questionsWithMetadata: QuestionWithMetadata[] = questions.map(
        (q, index) => ({
          ...q,
          question_id: `${tutorialId}_${userId}_${attemptNumber}_${index}`,
          tutorial_id: tutorialId,
          user_id: userId,
          attempt_number: attemptNumber,
          created_at: new Date().toISOString(),
        }),
      );

      // Store questions in memory for answer validation
      questionsWithMetadata.forEach((q) => {
        this.questions.set(q.question_id, q);
      });

      // Cache the questions
      await setCachedData(cacheKey, questionsWithMetadata);

      logger.info(
        `Generated and cached ${questionsWithMetadata.length} questions for tutorial ${tutorialId}`,
      );

      return questionsWithMetadata;
    } catch (error) {
      const appError = error as AppError;
      logger.error(`Error in generateQuestions: ${appError.message}`);
      throw error;
    }
  }

  calculateDifficulty(attemptNumber: number): "easy" | "medium" | "hard" {
    // Simple difficulty progression
    if (attemptNumber === 1) {
      return "easy";
    } else if (attemptNumber === 2) {
      return "medium";
    } else {
      return "hard";
    }
  }

  getQuestion(questionId: string): QuestionWithMetadata {
    const question = this.questions.get(questionId);
    if (!question) {
      throw new AppError("Question not found", 404);
    }
    return question;
  }

  validateAnswer(questionId: string, selectedAnswer: number): AnswerValidationResult {
    const question = this.getQuestion(questionId);
    const isCorrect = question.correct_answer === selectedAnswer;

    return {
      isCorrect,
      correctAnswer: question.correct_answer,
      selectedAnswer,
      question: question.question,
      options: question.options,
    };
  }
}

export default new QuestionService();
