import axios, { AxiosError } from 'axios';
import config from '../config/config';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import { LLMQuestion } from '../types';

class LLMService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.llmService.url;
  }

  async generateQuestions(content: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium', count: number = 3): Promise<LLMQuestion[]> {
    try {
      logger.info(`Generating ${count} questions with difficulty: ${difficulty}`);

      const response = await axios.post(
        `${this.baseURL}/api/llm/generate-questions`,
        {
          content,
          difficulty,
          count,
        },
        {
          timeout: 30000, // 30 seconds for LLM processing
        }
      );

      if (!response.data || !response.data.data || !response.data.data.questions) {
        throw new AppError('Invalid response from LLM service', 500);
      }

      logger.info(`Successfully generated ${response.data.data.questions.length} questions`);

      return response.data.data.questions;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED') {
        logger.error('Request timeout when generating questions');
        throw new AppError('Request timeout when generating questions', 504);
      }

      if (axiosError.code === 'ECONNREFUSED') {
        logger.error('LLM Service is not available');
        throw new AppError('LLM Service is not available', 503);
      }

      if (axiosError.response) {
        logger.error(`Error from LLM service: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        throw new AppError(`Failed to generate questions: ${axiosError.response.statusText}`, axiosError.response.status);
      }

      const appError = error as AppError;
      logger.error(`Error generating questions: ${appError.message}`);
      throw new AppError(appError.message || 'Failed to generate questions', 500);
    }
  }

  async generateFeedback(question: string, selectedAnswer: string, correctAnswer: string, isCorrect: boolean): Promise<string> {
    try {
      logger.info(`Generating feedback for question, isCorrect: ${isCorrect}`);

      const response = await axios.post(
        `${this.baseURL}/api/llm/generate-feedback`,
        {
          question,
          selectedAnswer,
          correctAnswer,
          isCorrect,
        },
        {
          timeout: 20000, // 20 seconds for LLM processing
        }
      );

      if (!response.data || !response.data.data || !response.data.data.feedback) {
        throw new AppError('Invalid response from LLM service', 500);
      }

      logger.info('Successfully generated feedback');

      return response.data.data.feedback;
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED') {
        logger.error('Request timeout when generating feedback');
        throw new AppError('Request timeout when generating feedback', 504);
      }

      if (axiosError.code === 'ECONNREFUSED') {
        logger.error('LLM Service is not available');
        throw new AppError('LLM Service is not available', 503);
      }

      if (axiosError.response) {
        logger.error(`Error from LLM service: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        throw new AppError(`Failed to generate feedback: ${axiosError.response.statusText}`, axiosError.response.status);
      }

      const appError = error as AppError;
      logger.error(`Error generating feedback: ${appError.message}`);
      throw new AppError(appError.message || 'Failed to generate feedback', 500);
    }
  }
}

export default new LLMService();
