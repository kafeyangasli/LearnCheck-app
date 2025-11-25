import { Question } from '../types/definitions';
import logger from '../config/logger';
import * as cheerio from 'cheerio';

export const parseHtmlContent = (html: string): string => {
  const $ = cheerio.load(html);
  const text = $('body').text();
  return text.replace(/\s\s+/g, ' ').trim();
};

export const parseQuestions = (text: string): Question[] => {
  try {
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (error) {
    logger.error('[HTMLParser] Failed to parse questions JSON:', error);
    return [];
  }
};
