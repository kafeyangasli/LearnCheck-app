// Load environment variables FIRST (before any imports)
import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mainRouter from './routes/main.routes';
import { errorHandler } from './utils/errorHandler';
import { initializeRedis } from './services/redis.service';
import { securityMiddleware } from './middleware/security';
import { requestLogger } from './middleware/requestLogger';
import { apiLimiter } from './middleware/rateLimit';
import logger from './config/logger';

const app: Express = express();

// Initialize Redis connection (non-blocking)
initializeRedis().catch((error) => {
  logger.error('[App] Failed to initialize Redis:', error);
  logger.info('[App] Continuing without Redis cache...');
});

// Security Middleware
app.use(securityMiddleware);

// Logging Middleware
app.use(requestLogger);

// Standard Middleware
app.use(cors());
app.use(express.json());

// Rate Limiting
app.use('/api', apiLimiter);

// Main Router
app.use('/api/v1', mainRouter);

// Health check endpoint
app.get('/', (req: Request, res: Response) => {
  res.status(200).send('LearnCheck! Backend is healthy.');
});

// Error Handler
app.use(errorHandler);

export default app;
