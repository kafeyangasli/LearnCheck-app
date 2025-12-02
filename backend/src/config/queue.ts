import { Queue, QueueOptions } from "bullmq";
import IORedis from "ioredis";
import logger from "./logger";
import type { AssessmentJobData } from "../types/definitions";

export type { AssessmentJobData };

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";
const createRedisConnection = (): IORedis => {
  const isUpstash = redisUrl.includes("upstash.io");
  const isTls = redisUrl.startsWith("rediss://") || isUpstash;
  const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    ...(isTls && {
      tls: {
        rejectUnauthorized: false,
      },
    }),
  });

  connection.on("connect", () => {
    logger.info("[BullMQ] Redis connection established");
  });
  connection.on("error", (err: Error) => {
    logger.error("[BullMQ] Redis connection error:", err);
  });

  return connection;
};
let sharedConnection: IORedis | null = null;

export const getQueueConnection = (): IORedis => {
  if (!sharedConnection) {
    sharedConnection = createRedisConnection();
  }

  return sharedConnection;
};

const queueOptions: QueueOptions = {
  connection: getQueueConnection(),
  defaultJobOptions: {
    removeOnComplete: {
      count: 100,
      age: 3600,
    },
    removeOnFail: {
      count: 50,
    },
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
};

export const assessmentQueue = new Queue<AssessmentJobData>(
  "assessment-generation",
  queueOptions,
);

assessmentQueue.on("error", (err: Error) => {
  logger.error("[AssessmentQueue] Queue error:", err);
});

export const closeQueueConnection = async (): Promise<void> => {
  if (sharedConnection) {
    await assessmentQueue.close();
    await sharedConnection.quit();
    sharedConnection = null;
    logger.info("[BullMQ] Queue connection closed");
  }
};

export const QUEUE_JOBS = {
  GENERATE_ASSESSMENT: "generate-assessment",
} as const;

export const getJobResultKey = (tutorialId: string, userId: string): string => {
  return `assessment:${tutorialId}:${userId}`;
};

export const JOB_RESULT_TTL = 60 * 60;
