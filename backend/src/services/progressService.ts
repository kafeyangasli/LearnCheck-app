import { getCachedData, setCachedData } from '../config/redis';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import { Progress, AttemptData, Attempt } from '../types';

class ProgressService {
  private progressData: Map<string, Progress>;

  constructor() {
    this.progressData = new Map<string, Progress>();
  }

  async getProgress(userId: string, tutorialId: string): Promise<Progress> {
    try {
      const cacheKey = `progress:${userId}:${tutorialId}`;

      // Try to get from cache first
      let progress = await getCachedData<Progress>(cacheKey);

      // Fallback to in-memory storage
      if (!progress) {
        const memoryKey = `${userId}:${tutorialId}`;
        progress = this.progressData.get(memoryKey) || {
          user_id: userId,
          tutorial_id: tutorialId,
          attempts: [],
        };
      }

      logger.info(`Retrieved progress for user ${userId}, tutorial ${tutorialId}`);
      return progress;
    } catch (error) {
      const appError = error as AppError;
      logger.error(`Error getting progress: ${appError.message}`);
      throw new AppError('Failed to retrieve progress', 500);
    }
  }

  async saveProgress(userId: string, tutorialId: string, attemptData: AttemptData): Promise<Progress> {
    try {
      // Validate attempt data
      if (!attemptData.timestamp || attemptData.score === undefined) {
        throw new AppError('Invalid attempt data', 400);
      }

      // Get existing progress
      const progress = await this.getProgress(userId, tutorialId);

      // Add new attempt
      const newAttempt: Attempt = {
        attempt_number: progress.attempts.length + 1,
        timestamp: attemptData.timestamp,
        score: attemptData.score,
        total_questions: attemptData.total_questions || 3,
        difficulty: attemptData.difficulty || 'medium',
        time_taken: attemptData.time_taken,
        answers: attemptData.answers || [],
      };

      progress.attempts.push(newAttempt);

      // Calculate statistics
      progress.total_attempts = progress.attempts.length;
      progress.average_score = this.calculateAverageScore(progress.attempts);
      progress.best_score = this.calculateBestScore(progress.attempts);
      progress.last_attempt = newAttempt.timestamp;

      // Save to cache
      const cacheKey = `progress:${userId}:${tutorialId}`;
      await setCachedData(cacheKey, progress, 86400); // Cache for 24 hours

      // Save to in-memory storage as fallback
      const memoryKey = `${userId}:${tutorialId}`;
      this.progressData.set(memoryKey, progress);

      logger.info(`Saved progress for user ${userId}, tutorial ${tutorialId}, attempt ${newAttempt.attempt_number}`);

      return progress;
    } catch (error) {
      const appError = error as AppError;
      logger.error(`Error saving progress: ${appError.message}`);
      throw new AppError(appError.message || 'Failed to save progress', 500);
    }
  }

  private calculateAverageScore(attempts: Attempt[]): string {
    if (attempts.length === 0) return '0';
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0);
    return (totalScore / attempts.length).toFixed(2);
  }

  private calculateBestScore(attempts: Attempt[]): number {
    if (attempts.length === 0) return 0;
    return Math.max(...attempts.map(attempt => attempt.score));
  }

  async getNextDifficulty(userId: string, tutorialId: string): Promise<'easy' | 'medium' | 'hard'> {
    try {
      const progress = await this.getProgress(userId, tutorialId);

      if (progress.attempts.length === 0) {
        return 'easy';
      }

      // Get last 3 attempts
      const recentAttempts = progress.attempts.slice(-3);
      const averageScore = parseFloat(this.calculateAverageScore(recentAttempts));
      const totalQuestions = recentAttempts[0].total_questions || 3;
      const averagePercentage = (averageScore / totalQuestions) * 100;

      // Adaptive difficulty based on performance
      if (averagePercentage >= 80) {
        return 'hard';
      } else if (averagePercentage >= 60) {
        return 'medium';
      } else {
        return 'easy';
      }
    } catch (error) {
      const appError = error as AppError;
      logger.error(`Error calculating next difficulty: ${appError.message}`);
      return 'medium'; // Default to medium on error
    }
  }
}

export default new ProgressService();
