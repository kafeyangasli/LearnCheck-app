
import * as cheerio from 'cheerio';

export const parseHtmlContent = (html: string): string => {
  const $ = cheerio.load(html);
  // Extract text from the body, which is a simplistic approach.
  // A more robust solution might target specific elements.
  const text = $('body').text();
  // Clean up whitespace
  return text.replace(/\s\s+/g, ' ').trim();
};
