import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    port: number;
    env: string;
  };
  redis: {
    host: string;
    port: number;
    password: string;
    ttl: number;
  };
  llmService: {
    url: string;
  };
  mockDicodingApi: {
    url: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
  cors: {
    allowedOrigins: string[];
  };
  logging: {
    level: string;
  };
}

const config: Config = {
  server: {
    port: parseInt(process.env.PORT || '3001'),
    env: process.env.NODE_ENV || 'development',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || '',
    ttl: parseInt(process.env.REDIS_TTL || '3600'),
  },
  llmService: {
    url: process.env.LLM_SERVICE_URL || 'http://localhost:3002',
  },
  mockDicodingApi: {
    url: process.env.MOCK_DICODING_API_URL || 'https://learncheck-dicoding-mock-666748076441.europe-west1.run.app',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '60'),
  },
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'],
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
