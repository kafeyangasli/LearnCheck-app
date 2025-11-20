import { createClient, RedisClientType } from 'redis';
import config from './config';
import logger from './logger';

let redisClient: RedisClientType | null = null;
let isRedisConnected = false;

export const initRedis = async (): Promise<RedisClientType | null> => {
  try {
    redisClient = createClient({
      socket: {
        host: config.redis.host,
        port: config.redis.port,
      },
      password: config.redis.password || undefined,
    });

    redisClient.on('error', (err: Error) => {
      logger.error('Redis Client Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      logger.info('Redis Client Connected');
      isRedisConnected = true;
    });

    redisClient.on('ready', () => {
      logger.info('Redis Client Ready');
      isRedisConnected = true;
    });

    redisClient.on('end', () => {
      logger.info('Redis Client Disconnected');
      isRedisConnected = false;
    });

    await redisClient.connect();
    return redisClient;
  } catch (error) {
    logger.error('Failed to initialize Redis:', error);
    isRedisConnected = false;
    return null;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const isConnected = (): boolean => {
  return isRedisConnected;
};

export const getCachedData = async <T>(key: string): Promise<T | null> => {
  if (!isRedisConnected || !redisClient) {
    logger.warn('Redis not connected, skipping cache get');
    return null;
  }

  try {
    const data = await redisClient.get(key);
    if (data) {
      logger.info(`Cache hit for key: ${key}`);
      return JSON.parse(data) as T;
    }
    logger.info(`Cache miss for key: ${key}`);
    return null;
  } catch (error) {
    logger.error('Error getting cached data:', error);
    return null;
  }
};

export const setCachedData = async (key: string, data: any, ttl: number = config.redis.ttl): Promise<boolean> => {
  if (!isRedisConnected || !redisClient) {
    logger.warn('Redis not connected, skipping cache set');
    return false;
  }

  try {
    await redisClient.setEx(key, ttl, JSON.stringify(data));
    logger.info(`Cache set for key: ${key} with TTL: ${ttl}s`);
    return true;
  } catch (error) {
    logger.error('Error setting cached data:', error);
    return false;
  }
};

export const deleteCachedData = async (key: string): Promise<boolean> => {
  if (!isRedisConnected || !redisClient) {
    logger.warn('Redis not connected, skipping cache delete');
    return false;
  }

  try {
    await redisClient.del(key);
    logger.info(`Cache deleted for key: ${key}`);
    return true;
  } catch (error) {
    logger.error('Error deleting cached data:', error);
    return false;
  }
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit();
    logger.info('Redis connection closed');
  }
};
