import dotenv from "dotenv";

dotenv.config();
import { Worker, Job, JobProgress } from "bullmq";
import IORedis from "ioredis";
import logger from "./config/logger";
import { QUEUE_JOBS, getJobResultKey, JOB_RESULT_TTL } from "./config/queue";
import type { AssessmentJobData } from "./types/definitions";
import {
  getTutorialContent,
  getUserPreferences,
} from "./services/dicoding.service";
import {
  generateAssessmentQuestions,
  selectRandomQuestions,
} from "./services/gemini.service";
import { parseHtmlContent } from "./utils/htmlParser";
import { getCache, setCache, initializeRedis } from "./services/redis.service";
import type { Assessment, AssessmentResponse } from "./types/definitions";

initializeRedis().catch((error) => {
  logger.error("[Worker] Failed to initialize Redis cache:", error);
});

const createWorkerConnection = (): IORedis => {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
  const isUpstash = redisUrl.includes("upstash.io");
  const isTls = redisUrl.startsWith("rediss://") || isUpstash;

  return new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(isTls && {
      tls: {
        rejectUnauthorized: false,
      },
    }),
  });
};

let resultStoreConnection: IORedis | null = null;
const getResultStoreConnection = (): IORedis => {
  if (!resultStoreConnection) {
    resultStoreConnection = createWorkerConnection();
  }

  return resultStoreConnection;
};

const CACHE_CONFIG = {
  QUIZ_TTL: 24 * 60 * 60,
} as const;

const getCacheKey = {
  quizPool: (tutorialId: string) => `learncheck:quiz:pool:${tutorialId}`,
};

const processAssessmentJob = async (
  job: Job<AssessmentJobData>,
): Promise<void> => {
  const { tutorialId, userId, skipCache } = job.data;
  const resultKey = getJobResultKey(tutorialId, userId);
  const resultStore = getResultStoreConnection();

  logger.info(
    `[Worker] Processing job ${job.id} for tutorial ${tutorialId}, user ${userId}`,
  );

  try {
    await job.updateProgress(10);
    const poolKey = getCacheKey.quizPool(tutorialId);
    let fullAssessment: Assessment | null = null;

    if (!skipCache) {
      const cachedPool = await getCache(poolKey);

      if (cachedPool) {
        fullAssessment = JSON.parse(cachedPool) as Assessment;
        logger.info(
          `[Worker] Using cached pool with ${fullAssessment.questions.length} questions`,
        );
      }
    }

    await job.updateProgress(20);

    if (!fullAssessment) {
      logger.info(`[Worker] Fetching tutorial content for ${tutorialId}`);
      const tutorialHtml = await getTutorialContent(tutorialId);
      const textContent = parseHtmlContent(tutorialHtml);

      await job.updateProgress(40);
      logger.info(
        `[Worker] Generating questions with Gemini AI for ${tutorialId}`,
      );
      fullAssessment = await generateAssessmentQuestions(textContent);
      await job.updateProgress(80);
      await setCache(
        poolKey,
        JSON.stringify(fullAssessment),
        CACHE_CONFIG.QUIZ_TTL,
      );
      logger.info(
        `[Worker] Cached quiz pool with ${fullAssessment.questions.length} questions`,
      );
    }

    const randomAssessment = selectRandomQuestions(fullAssessment);

    logger.info(
      `[Worker] Selected ${randomAssessment.questions.length} random questions`,
    );
    await job.updateProgress(90);
    const userPreferences = await getUserPreferences(userId);
    const assessmentResponse: AssessmentResponse = {
      assessment: randomAssessment,
      userPreferences,
      fromCache: fullAssessment !== null,
    };

    await resultStore.setex(
      resultKey,
      JOB_RESULT_TTL,
      JSON.stringify({
        status: "completed",
        data: assessmentResponse,
        completedAt: new Date().toISOString(),
      }),
    );
    await job.updateProgress(100);
    logger.info(
      `[Worker] Job ${job.id} completed successfully. Result stored at ${resultKey}`,
    );
  } catch (error) {
    logger.error(`[Worker] Job ${job.id} failed:`, error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    await resultStore.setex(
      resultKey,
      JOB_RESULT_TTL,
      JSON.stringify({
        status: "failed",
        error: errorMessage,
        failedAt: new Date().toISOString(),
      }),
    );
    throw error;
  }
};

const worker = new Worker<AssessmentJobData>(
  "assessment-generation",
  processAssessmentJob,
  {
    connection: createWorkerConnection(),
    concurrency: 5,
    limiter: {
      max: 10,
      duration: 60000,
    },
  },
);

worker.on("completed", (job: Job<AssessmentJobData>) => {
  logger.info(`[Worker] Job ${job.id} completed`);
});
worker.on("failed", (job: Job<AssessmentJobData> | undefined, err: Error) => {
  logger.error(`[Worker] Job ${job?.id} failed:`, err.message);
});
worker.on("active", (job: Job<AssessmentJobData>) => {
  logger.info(`[Worker] Job ${job.id} is now active`);
});
worker.on("progress", (job: Job<AssessmentJobData>, progress: JobProgress) => {
  logger.debug(`[Worker] Job ${job.id} progress: ${progress}%`);
});
worker.on("error", (err: Error) => {
  logger.error("[Worker] Worker error:", err);
});
const gracefulShutdown = async (signal: string) => {
  logger.info(`[Worker] ${signal} received, shutting down gracefully...`);
  await worker.close();

  if (resultStoreConnection) {
    await resultStoreConnection.quit();
  }

  logger.info("[Worker] Shutdown complete");
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
logger.info("[Worker] Assessment worker started with concurrency: 5");
