import { getUserPreferences } from "./dicoding.service";
import { selectRandomQuestions } from "./gemini.service";
import { getCache, setCache } from "./redis.service";
import { assessmentQueue, QUEUE_JOBS, getJobResultKey } from "../config/queue";
import type {
  AssessmentResponse,
  UserPreferences,
  Assessment,
  JobResultCompleted,
  JobResultFailed,
} from "../types/definitions";
import logger from "../config/logger";

const CACHE_CONFIG = {
  QUIZ_TTL: 24 * 60 * 60,
  PREFERENCES_TTL: 5,
  RATE_LIMIT_WINDOW: 60,
  MAX_REQUESTS_PER_MINUTE: 10,
  SESSION_TTL: 60 * 60,
} as const;

const getCacheKey = {
  quizPool: (tutorialId: string) => `learncheck:quiz:pool:${tutorialId}`,
  preferences: (userId: string) => `learncheck:prefs:user:${userId}`,
  rateLimit: (userId: string) => `learncheck:ratelimit:${userId}`,
  activeSession: (tutorialId: string, userId: string) =>
    `learncheck:session:${tutorialId}:${userId}`,
};

export const getJobResult = async (
  tutorialId: string,
  userId: string,
): Promise<JobResultCompleted | JobResultFailed | null> => {
  const resultKey = getJobResultKey(tutorialId, userId);
  const cached = await getCache(resultKey);

  if (!cached) {
    return null;
  }

  try {
    const result = JSON.parse(cached);

    if (result.status === "completed" || result.status === "failed") {
      return result;
    }

    return null;
  } catch {
    return null;
  }
};

export const getActiveSession = async (
  tutorialId: string,
  userId: string,
): Promise<AssessmentResponse | null> => {
  const sessionKey = getCacheKey.activeSession(tutorialId, userId);
  const cachedSession = await getCache(sessionKey);

  if (!cachedSession) {
    return null;
  }

  try {
    const session = JSON.parse(cachedSession) as AssessmentResponse;
    logger.info(
      `[Assessment] Found active session for user ${userId}, tutorial ${tutorialId}`,
    );
    return session;
  } catch (error) {
    logger.error("[Assessment] Failed to parse active session:", error);
    return null;
  }
};

export const clearActiveSession = async (
  tutorialId: string,
  userId: string,
): Promise<void> => {
  const sessionKey = getCacheKey.activeSession(tutorialId, userId);
  await setCache(sessionKey, "", 1);
  logger.info(
    `[Assessment] Cleared active session for user ${userId}, tutorial ${tutorialId}`,
  );
};

const saveActiveSession = async (
  tutorialId: string,
  userId: string,
  assessment: AssessmentResponse,
): Promise<void> => {
  const sessionKey = getCacheKey.activeSession(tutorialId, userId);
  await setCache(
    sessionKey,
    JSON.stringify(assessment),
    CACHE_CONFIG.SESSION_TTL,
  );
  logger.info(
    `[Assessment] Saved active session for user ${userId}, tutorial ${tutorialId}`,
  );
};

export const getCachedAssessment = async (
  tutorialId: string,
  userId: string,
): Promise<AssessmentResponse | null> => {
  const poolKey = getCacheKey.quizPool(tutorialId);
  const cachedPool = await getCache(poolKey);

  if (!cachedPool) {
    return null;
  }

  try {
    const fullAssessment = JSON.parse(cachedPool) as Assessment;

    logger.info(
      `[Assessment] Using cached pool with ${fullAssessment.questions.length} questions`,
    );
    const randomAssessment = selectRandomQuestions(fullAssessment);
    const userPreferences = await getUserPreferences(userId);

    const assessmentResponse: AssessmentResponse = {
      assessment: randomAssessment,
      userPreferences,
      fromCache: true,
    };

    // Save as active session so reload returns same questions
    await saveActiveSession(tutorialId, userId, assessmentResponse);

    return assessmentResponse;
  } catch (error) {
    logger.error("[Assessment] Failed to parse cached pool:", error);

    return null;
  }
};

export const addAssessmentJob = async (
  tutorialId: string,
  userId: string,
  skipCache: boolean,
  jobId: string,
): Promise<void> => {
  const existingJob = await assessmentQueue.getJob(jobId);

  if (existingJob) {
    const state = await existingJob.getState();

    if (state === "active" || state === "waiting" || state === "delayed") {
      logger.info(
        `[Assessment] Job ${jobId} already in queue with state: ${state}`,
      );

      return;
    }
  }

  await assessmentQueue.add(
    QUEUE_JOBS.GENERATE_ASSESSMENT,
    {
      tutorialId,
      userId,
      skipCache,
    },
    {
      jobId,
      removeOnComplete: { count: 100, age: 3600 },
      removeOnFail: { count: 50 },
    },
  );
  logger.info(
    `[Assessment] Added job ${jobId} to queue for tutorial ${tutorialId}`,
  );
};

export const fetchUserPreferences = async (
  userId: string,
): Promise<UserPreferences> => {
  const cacheKey = getCacheKey.preferences(userId);
  const cached = await getCache(cacheKey);

  if (cached) {
    logger.debug(`[Preferences] Using cached preferences for user ${userId}`);

    return JSON.parse(cached) as UserPreferences;
  }

  logger.debug(`[Preferences] Fetching fresh preferences for user ${userId}`);
  const preferences = await getUserPreferences(userId);

  await setCache(
    cacheKey,
    JSON.stringify(preferences),
    CACHE_CONFIG.PREFERENCES_TTL,
  );

  return preferences;
};
