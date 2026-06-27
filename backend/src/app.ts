import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import routes from './routes';
import { notFound, errorHandler } from './middleware/error';

export function createApp(): Application {
  const app = express();

  // Render (and most PaaS) sit behind a reverse proxy. Trust the first proxy hop so
  // client IPs (used by rate limiting) and protocol are read from X-Forwarded-* headers.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.clientOrigins.includes('*') ? true : env.clientOrigins,
      credentials: true,
    })
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  // Global, generous rate limit (auth has stricter limits of its own).
  app.use(rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));

  app.get('/', (_req, res) =>
    res.json({ name: 'QuickBite API', version: '1.0.0', docs: '/api/health' })
  );

  app.use('/api', routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
