import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
    env: string;
  };
  gemini: {
    apiKey: string | undefined;
    model: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    ttl: number;
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3002'),
    env: process.env.NODE_ENV || 'development',
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL || '3600'),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
