import express, { Express } from 'express';
import { apiRouter } from './routes.js';

export function createServerApp(): Express {
  const app = express();
  app.use(express.json({ limit: '10mb' }));
  app.use('/api', apiRouter);
  return app;
}
