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

initializeRedis().catch((error) => {
  logger.error('[App] Failed to initialize Redis:', error);
  logger.info('[App] Continuing without Redis cache...');
});

app.use(securityMiddleware);

app.use(requestLogger);

app.use(cors());
app.use(express.json());

app.use('/api', apiLimiter);

app.use('/api/v1', mainRouter);

app.get('/', (req: Request, res: Response) => {
  res.status(200).send('LearnCheck! Backend is healthy.');
});

app.use(errorHandler);

export default app;
