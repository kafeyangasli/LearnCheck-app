import axios, { AxiosError } from 'axios';
import config from '../config/config';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import { TutorialContent } from '../types';

class DicodingService {
  private baseURL: string;

  constructor() {
    this.baseURL = config.mockDicodingApi.url;
  }

  async getTutorialContent(tutorialId: string): Promise<TutorialContent> {
    try {
      logger.info(`Fetching tutorial content for ID: ${tutorialId}`);

      const response = await axios.get(`${this.baseURL}/api/tutorials/${tutorialId}`, {
        timeout: 10000,
      });

      if (response.data.status !== 'success') {
        throw new AppError('Failed to fetch tutorial content', 500);
      }

      const content = response.data.data.content;

      // Strip HTML tags for LLM processing
      const textContent = this.stripHtmlTags(content);

      logger.info(`Successfully fetched tutorial content for ID: ${tutorialId}`);

      return {
        tutorialId,
        content: textContent,
        rawContent: content,
      };
    } catch (error) {
      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNABORTED') {
        logger.error('Request timeout when fetching tutorial content');
        throw new AppError('Request timeout when fetching tutorial content', 504);
      }

      if (axiosError.response) {
        logger.error(`Error fetching tutorial content: ${axiosError.response.status} - ${axiosError.response.statusText}`);
        throw new AppError(`Failed to fetch tutorial content: ${axiosError.response.statusText}`, axiosError.response.status);
      }

      const appError = error as AppError;
      logger.error(`Error fetching tutorial content: ${appError.message}`);
      throw new AppError(appError.message || 'Failed to fetch tutorial content', 500);
    }
  }

  private stripHtmlTags(html: string): string {
    // Remove HTML tags and decode HTML entities
    let text = html.replace(/<[^>]*>/g, ' ');

    // Decode common HTML entities
    text = text
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // Remove extra whitespace
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  async getTutorialMetadata(tutorialId: string): Promise<{ tutorialId: string; status: string; message: string }> {
    try {
      logger.info(`Fetching tutorial metadata for ID: ${tutorialId}`);

      const response = await axios.get(`${this.baseURL}/api/tutorials/${tutorialId}`, {
        timeout: 10000,
      });

      if (response.data.status !== 'success') {
        throw new AppError('Failed to fetch tutorial metadata', 500);
      }

      return {
        tutorialId,
        status: response.data.status,
        message: response.data.message,
      };
    } catch (error) {
      const appError = error as AppError;
      logger.error(`Error fetching tutorial metadata: ${appError.message}`);
      throw new AppError(appError.message || 'Failed to fetch tutorial metadata', 500);
    }
  }
}

export default new DicodingService();
