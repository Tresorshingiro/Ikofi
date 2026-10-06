import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { originCheck } from './middleware/originCheck.js';
import { apiRouter } from './routes/index.js';

export function createApp() {
  const app = express();

  app.set('trust proxy', env.trustProxy);
  app.use(helmet());
  app.use(morgan(env.isProd ? 'combined' : 'dev'));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(originCheck);

  app.use('/api', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}