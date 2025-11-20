import { Request, Response } from "express";
import questionService from "../services/questionService";
import llmService from "../services/llmService";
import progressService from "../services/progressService";
import { asyncHandler } from "../middleware/errorHandler";
import logger from "../config/logger";

export const generateQuestions = asyncHandler(
  async (req: Request, res: Response) => {
    const { tutorial_id, user_id, attempt_number } = req.body;

    logger.info(
      `Generating questions for tutorial ${tutorial_id}, user ${user_id}, attempt ${attempt_number}`,
    );

    // Get adaptive difficulty based on user's progress
    let difficulty = questionService.calculateDifficulty(attempt_number);

    if (attempt_number > 1) {
      difficulty = await progressService.getNextDifficulty(
        user_id,
        tutorial_id,
      );
    }

    // Generate questions
    const questions = await questionService.generateQuestions(
      tutorial_id,
      user_id,
      attempt_number,
    );

    // Remove correct_answer from response (don't expose to client)
    const questionsWithoutAnswers = questions.map((q) => ({
      question_id: q.question_id,
      question: q.question,
      options: q.options,
      difficulty: q.difficulty,
    }));

    res.status(200).json({
      status: "success",
      data: {
        questions: questionsWithoutAnswers,
        tutorial_id,
        user_id,
        attempt_number,
        difficulty,
      },
    });
  },
);

export const submitAnswer = asyncHandler(
  async (req: Request, res: Response) => {
    const { question_id, selected_answer } = req.body;

    // Check the answer
    const result = questionService.validateAnswer(question_id, selected_answer);

    // Get the text for selected and correct answer options
    const selectedOptionText = result.options[result.selectedAnswer] || "";
    const correctOptionText = result.options[result.correctAnswer] || "";

    // Generate adaptive feedback using LLM
    const feedback = await llmService.generateFeedback(
      result.question,
      selectedOptionText,
      correctOptionText,
      result.isCorrect,
    );

    res.status(200).json({
      status: "success",
      data: {
        is_correct: result.isCorrect,
        correct_answer: result.correctAnswer,
        selected_answer: result.selectedAnswer,
        feedback,
      },
    });
  },
);
