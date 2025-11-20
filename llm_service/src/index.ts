import app from './app';
import config from './config/config';
import logger from './config/logger';
import { initRedis, closeRedis } from './config/redis';
import fs from 'fs';
import path from 'path';
import { Server } from 'http';

const PORT = config.server.port;

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Initialize server
let server: Server;

async function startServer(): Promise<void> {
  try {
    // Validate Gemini API Key
    if (!config.gemini.apiKey) {
      logger.error('GEMINI_API_KEY is not configured. Please set it in .env file');
      process.exit(1);
    }

    // Try to connect to Redis
    logger.info('Attempting to connect to Redis...');
    await initRedis();
    logger.info('Redis connected successfully (or running without Redis)');
  } catch (error) {
    const err = error as Error;
    logger.warn('Redis connection failed, running without cache:', err.message);
  }

  // Start Express server
  server = app.listen(PORT, () => {
    logger.info(`LLM Service API running on port ${PORT}`);
    logger.info(`Environment: ${config.server.env}`);
    logger.info(`Gemini Model: ${config.gemini.model}`);
    logger.info(`Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await closeRedis();
      process.exit(0);
    });
  }
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');

  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed');
      await closeRedis();
      process.exit(0);
    });
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...', err);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

startServer();
