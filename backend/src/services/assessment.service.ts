import { getTutorialContent, getUserPreferences } from './dicoding.service';
import { generateAssessmentQuestions, selectRandomQuestions } from './gemini.service';
import { parseHtmlContent } from '../utils/htmlParser';
import { getCache, setCache, hasCache, incrementRateLimit } from './redis.service';
import type { AssessmentResponse, UserPreferences, Assessment } from '../types/definitions';

// Cache configuration
const CACHE_CONFIG = {
  QUIZ_TTL: 24 * 60 * 60, // 24 hours for quiz pool (18 questions)
  PREFERENCES_TTL: 5 * 60, // 5 minutes for user preferences
  RATE_LIMIT_WINDOW: 60, // 1 minute window
  MAX_REQUESTS_PER_MINUTE: 5, // Max 5 quiz generations per minute per user
} as const;

// Cache key patterns
const getCacheKey = {
  quizPool: (tutorialId: string) => `learncheck:quiz:pool:${tutorialId}`,
  preferences: (userId: string) => `learncheck:prefs:user:${userId}`,
  rateLimit: (userId: string) => `learncheck:ratelimit:${userId}`,
  generationLock: (tutorialId: string) => `learncheck:lock:generation:${tutorialId}`,
};

/**
 * Generate and cache full quiz pool (18 questions) in background
 * This runs asynchronously without blocking the response
 * @param tutorialId - Tutorial identifier
 */
const generateQuizPoolInBackground = async (tutorialId: string): Promise<void> => {
  const lockKey = getCacheKey.generationLock(tutorialId);
  const poolKey = getCacheKey.quizPool(tutorialId);

  try {
    // Check if generation is already in progress (lock exists)
    if (await hasCache(lockKey)) {
      console.log(`[Background] Quiz generation already in progress for tutorial ${tutorialId}`);
      return;
    }

    // Check if pool already exists
    if (await hasCache(poolKey)) {
      console.log(`[Background] Quiz pool already exists for tutorial ${tutorialId}`);
      return;
    }

    // Set lock to prevent duplicate generations (TTL 5 minutes)
    await setCache(lockKey, 'generating', 300);
    console.log(`[Background] Starting quiz generation for tutorial ${tutorialId}`);

    // Fetch tutorial content and generate 18 questions
    const tutorialHtml = await getTutorialContent(tutorialId);
    const textContent = parseHtmlContent(tutorialHtml);

    console.log(`[Background] Generating 18 questions with Gemini for tutorial ${tutorialId}`);
    const fullAssessment = await generateAssessmentQuestions(textContent);

    // Cache the full pool for 24 hours
    await setCache(poolKey, JSON.stringify(fullAssessment), CACHE_CONFIG.QUIZ_TTL);
    console.log(`[Background] Successfully cached 18 questions for tutorial ${tutorialId}`);

  } catch (error) {
    console.error(`[Background] Failed to generate quiz pool for tutorial ${tutorialId}:`, error);
  } finally {
    // Remove lock
    const { deleteCache } = await import('./redis.service');
    await deleteCache(lockKey);
  }
};

/**
 * Fetch or generate assessment data for a tutorial
 * Returns 3 random questions from cached pool or generates new pool if needed
 * @param tutorialId - Tutorial identifier
 * @param userId - User identifier
 * @param skipCache - If true, bypass cache and generate fresh quiz pool
 * @returns Assessment with 3 random questions and user preferences
 * @throws Error if generation fails
 */
export const fetchAssessmentData = async (
  tutorialId: string,
  userId: string,
  skipCache: boolean = false
): Promise<AssessmentResponse> => {
  console.log(`[Assessment] Fetching quiz for tutorial ${tutorialId}, user ${userId}`);

  // Check rate limit (5 requests per minute per user)
  const rateLimitKey = getCacheKey.rateLimit(userId);
  const requestCount = await incrementRateLimit(rateLimitKey, CACHE_CONFIG.RATE_LIMIT_WINDOW);

  if (requestCount > CACHE_CONFIG.MAX_REQUESTS_PER_MINUTE) {
    console.warn(`[Assessment] Rate limit exceeded for user ${userId}`);
    throw new Error('Terlalu banyak permintaan. Silakan coba lagi dalam 1 menit.');
  }

  // Fetch user preferences
  const userPreferences = await getUserPreferences(userId);

  // Try to get quiz pool from cache
  const poolKey = getCacheKey.quizPool(tutorialId);
  let fullAssessment: Assessment | null = null;

  if (!skipCache) {
    const cachedPool = await getCache(poolKey);
    if (cachedPool) {
      fullAssessment = JSON.parse(cachedPool) as Assessment;
      console.log(`[Assessment] Using cached pool with ${fullAssessment.questions.length} questions`);
    }
  }

  // If no cache or skipCache requested, generate new pool
  if (!fullAssessment) {
    console.log(`[Assessment] Generating fresh quiz pool for tutorial ${tutorialId}`);

    const tutorialHtml = await getTutorialContent(tutorialId);
    const textContent = parseHtmlContent(tutorialHtml);

    fullAssessment = await generateAssessmentQuestions(textContent);

    // Cache the new pool
    await setCache(poolKey, JSON.stringify(fullAssessment), CACHE_CONFIG.QUIZ_TTL);
    console.log(`[Assessment] Cached new pool with ${fullAssessment.questions.length} questions`);
  }

  if (!fullAssessment) {
    throw new Error('Failed to retrieve or generate assessment');
  }

  // Select 3 random questions from the pool
  const randomAssessment = selectRandomQuestions(fullAssessment);
  console.log(`[Assessment] Selected 3 random questions from pool`);

  return {
    assessment: randomAssessment,
    userPreferences,
    fromCache: fullAssessment !== null,
  };
};

/**
 * Trigger background quiz generation when user opens tutorial
 * This is non-blocking and returns immediately
 * @param tutorialId - Tutorial identifier
 */
export const triggerBackgroundGeneration = async (tutorialId: string): Promise<void> => {
  // Fire and forget - don't await
  generateQuizPoolInBackground(tutorialId).catch((error) => {
    console.error(`[Background] Unhandled error in background generation:`, error);
  });

  console.log(`[Assessment] Triggered background generation for tutorial ${tutorialId}`);
};

/**
 * Fetch user preferences with Redis cache (5min TTL)
 * @param userId - User identifier
 * @returns User preferences object
 */
export const fetchUserPreferences = async (userId: string): Promise<UserPreferences> => {
  const cacheKey = getCacheKey.preferences(userId);

  // Try cache first
  const cached = await getCache(cacheKey);
  if (cached) {
    console.log(`[Preferences] Using cached preferences for user ${userId}`);
    return JSON.parse(cached) as UserPreferences;
  }

  // Fetch fresh if not cached
  console.log(`[Preferences] Fetching fresh preferences for user ${userId}`);
  const preferences = await getUserPreferences(userId);

  // Cache for 5 minutes
  await setCache(cacheKey, JSON.stringify(preferences), CACHE_CONFIG.PREFERENCES_TTL);

  return preferences;
};
