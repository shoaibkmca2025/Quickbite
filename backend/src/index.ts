import http from 'http';
import { createApp } from './app';
import { connectDB } from './config/db';
import { initSocket } from './socket';
import { env } from './config/env';
import { logger } from './config/logger';

async function bootstrap() {
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  server.listen(env.port, () => {
    logger.info(`QuickBite API listening on http://localhost:${env.port} (${env.nodeEnv})`);
    logger.info(`Socket.IO ready on ws://localhost:${env.port}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    server.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error', err);
  process.exit(1);
});
