import { createClient, RedisClientType } from 'redis';
import logger from '../config/logger';

let redisClient: RedisClientType | null = null;

/**
 * Initialize Redis connection
 * Falls back gracefully if Redis is not configured
 */
export const initializeRedis = async (): Promise<void> => {
  if (!process.env.REDIS_URL) {
    logger.warn('[Redis] REDIS_URL not configured - running without cache');
    return;
  }

  try {
    const redisUrl = process.env.REDIS_URL;
    // Enable TLS if protocol is rediss:// OR if host contains 'upstash.io'
    const isUpstash = redisUrl.includes('upstash.io');
    const isTls = redisUrl.startsWith('rediss://') || isUpstash;

    redisClient = createClient({
      url: redisUrl,
      pingInterval: 1000,
      socket: {
        tls: isTls,
        rejectUnauthorized: false, // Required for Upstash
        family: 0
      }
    });

    redisClient.on('error', (err: Error) => {
      logger.error('[Redis] Client error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('[Redis] Connected successfully');
    });

    await redisClient.connect();
    logger.info('[Redis] Initialization complete');
  } catch (error) {
    logger.error('[Redis] Failed to initialize:', error);
    redisClient = null; // Fall back to no cache
  }
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = (): boolean => {
  return redisClient !== null && redisClient.isOpen;
};

/**
 * Get value from Redis cache
 * @param key - Cache key
 * @returns Cached value or null
 */
export const getCache = async (key: string): Promise<string | null> => {
  if (!isRedisAvailable()) return null;

  try {
    const value = await redisClient!.get(key);
    if (value) {
      logger.debug(`[Redis] Cache HIT for key: ${key}`);
    } else {
      logger.debug(`[Redis] Cache MISS for key: ${key}`);
    }
    return value;
  } catch (error) {
    logger.error(`[Redis] Get error for key ${key}:`, error);
    return null;
  }
};

/**
 * Set value in Redis cache with TTL
 * @param key - Cache key
 * @param value - Value to cache (will be JSON stringified)
 * @param ttlSeconds - Time to live in seconds
 */
export const setCache = async (
  key: string,
  value: string,
  ttlSeconds: number
): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    await redisClient!.setEx(key, ttlSeconds, value);
    logger.debug(`[Redis] Cached key: ${key} with TTL: ${ttlSeconds}s`);
  } catch (error) {
    logger.error(`[Redis] Set error for key ${key}:`, error);
  }
};

/**
 * Delete value from Redis cache
 * @param key - Cache key to delete
 */
export const deleteCache = async (key: string): Promise<void> => {
  if (!isRedisAvailable()) return;

  try {
    await redisClient!.del(key);
    logger.debug(`[Redis] Deleted key: ${key}`);
  } catch (error) {
    logger.error(`[Redis] Delete error for key ${key}:`, error);
  }
};

/**
 * Check if a key exists in Redis
 * @param key - Cache key to check
 * @returns true if key exists, false otherwise
 */
export const hasCache = async (key: string): Promise<boolean> => {
  if (!isRedisAvailable()) return false;

  try {
    const exists = await redisClient!.exists(key);
    return exists === 1;
  } catch (error) {
    logger.error(`[Redis] Exists check error for key ${key}:`, error);
    return false;
  }
};

/**
 * Increment rate limit counter
 * @param key - Rate limit key (e.g., 'ratelimit:user:123')
 * @param windowSeconds - Time window in seconds
 * @returns Current count after increment
 */
export const incrementRateLimit = async (
  key: string,
  windowSeconds: number
): Promise<number> => {
  if (!isRedisAvailable()) return 0; // No rate limiting without Redis

  try {
    const count = await redisClient!.incr(key);

    // Set expiry only on first increment
    if (count === 1) {
      await redisClient!.expire(key, windowSeconds);
    }

    return count;
  } catch (error) {
    logger.error(`[Redis] Rate limit increment error for key ${key}:`, error);
    return 0; // Fail open - allow request
  }
};

/**
 * Close Redis connection (for graceful shutdown)
 */
export const closeRedis = async (): Promise<void> => {
  if (redisClient && redisClient.isOpen) {
    await redisClient.quit();
    logger.info('[Redis] Connection closed');
  }
};
