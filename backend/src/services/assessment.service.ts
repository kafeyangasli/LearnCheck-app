import { getTutorialContent, getUserPreferences } from './dicoding.service';
import { generateAssessmentQuestions, selectRandomQuestions } from './gemini.service';
import { parseHtmlContent } from '../utils/htmlParser';
import { getCache, setCache, hasCache, incrementRateLimit } from './redis.service';
import type { AssessmentResponse, UserPreferences, Assessment } from '../types/definitions';

const CACHE_CONFIG = {
  QUIZ_TTL: 24 * 60 * 60,
  PREFERENCES_TTL: 5 * 60,
  RATE_LIMIT_WINDOW: 60,
  MAX_REQUESTS_PER_MINUTE: 5,
} as const;

const getCacheKey = {
  quizPool: (tutorialId: string) => `learncheck:quiz:pool:${tutorialId}`,
  preferences: (userId: string) => `learncheck:prefs:user:${userId}`,
  rateLimit: (userId: string) => `learncheck:ratelimit:${userId}`,
  generationLock: (tutorialId: string) => `learncheck:lock:generation:${tutorialId}`,
};

const generateQuizPoolInBackground = async (tutorialId: string): Promise<void> => {
  const lockKey = getCacheKey.generationLock(tutorialId);
  const poolKey = getCacheKey.quizPool(tutorialId);

  try {
    if (await hasCache(lockKey)) {
      console.log(`[Background] Quiz generation already in progress for tutorial ${tutorialId}`);
      return;
    }

    if (await hasCache(poolKey)) {
      console.log(`[Background] Quiz pool already exists for tutorial ${tutorialId}`);
      return;
    }

    await setCache(lockKey, 'generating', 300);
    console.log(`[Background] Starting quiz generation for tutorial ${tutorialId}`);

    const tutorialHtml = await getTutorialContent(tutorialId);
    const textContent = parseHtmlContent(tutorialHtml);

    console.log(`[Background] Generating 18 questions with Gemini for tutorial ${tutorialId}`);
    const fullAssessment = await generateAssessmentQuestions(textContent);

    await setCache(poolKey, JSON.stringify(fullAssessment), CACHE_CONFIG.QUIZ_TTL);
    console.log(`[Background] Successfully cached 18 questions for tutorial ${tutorialId}`);

  } catch (error) {
    console.error(`[Background] Failed to generate quiz pool for tutorial ${tutorialId}:`, error);
  } finally {
    const { deleteCache } = await import('./redis.service');
    await deleteCache(lockKey);
  }
};

export const fetchAssessmentData = async (
  tutorialId: string,
  userId: string,
  skipCache: boolean = false
): Promise<AssessmentResponse> => {
  console.log(`[Assessment] Fetching quiz for tutorial ${tutorialId}, user ${userId}`);

  const rateLimitKey = getCacheKey.rateLimit(userId);
  const requestCount = await incrementRateLimit(rateLimitKey, CACHE_CONFIG.RATE_LIMIT_WINDOW);

  if (requestCount > CACHE_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    console.warn(`[Assessment] Rate limit exceeded for user ${userId}`);
    throw new Error('Terlalu banyak permintaan. Silakan coba lagi dalam 1 menit.');
  }

  const userPreferences = await getUserPreferences(userId);

  const poolKey = getCacheKey.quizPool(tutorialId);
  let fullAssessment: Assessment | null = null;

  if (!skipCache) {
    const cachedPool = await getCache(poolKey);
    if (cachedPool) {
      fullAssessment = JSON.parse(cachedPool) as Assessment;
      console.log(`[Assessment] Using cached pool with ${fullAssessment.questions.length} questions`);
    }
  }

  if (!fullAssessment) {
    console.log(`[Assessment] Generating fresh quiz pool for tutorial ${tutorialId}`);

    const tutorialHtml = await getTutorialContent(tutorialId);
    const textContent = parseHtmlContent(tutorialHtml);

    fullAssessment = await generateAssessmentQuestions(textContent);

    await setCache(poolKey, JSON.stringify(fullAssessment), CACHE_CONFIG.QUIZ_TTL);
    console.log(`[Assessment] Cached new pool with ${fullAssessment.questions.length} questions`);
  }

  if (!fullAssessment) {
    throw new Error('Failed to retrieve or generate assessment');
  }

  const randomAssessment = selectRandomQuestions(fullAssessment);
  console.log(`[Assessment] Selected 3 random questions from pool`);

  return {
    assessment: randomAssessment,
    userPreferences,
    fromCache: fullAssessment !== null,
  };
};

export const triggerBackgroundGeneration = async (tutorialId: string): Promise<void> => {
  generateQuizPoolInBackground(tutorialId).catch((error) => {
    console.error(`[Background] Unhandled error in background generation:`, error);
  });

  console.log(`[Assessment] Triggered background generation for tutorial ${tutorialId}`);
};

export const fetchUserPreferences = async (userId: string): Promise<UserPreferences> => {
  const cacheKey = getCacheKey.preferences(userId);

  const cached = await getCache(cacheKey);
  if (cached) {
    console.log(`[Preferences] Using cached preferences for user ${userId}`);
    return JSON.parse(cached) as UserPreferences;
  }

  console.log(`[Preferences] Fetching fresh preferences for user ${userId}`);
  const preferences = await getUserPreferences(userId);

  await setCache(cacheKey, JSON.stringify(preferences), CACHE_CONFIG.PREFERENCES_TTL);

  return preferences;
};
