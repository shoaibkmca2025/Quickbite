import http from 'http';
import { createApp } from './app';
import { connectDB } from './config/db';
import { initSocket } from './socket';
import { env } from './config/env';
import { logger } from './config/logger';

/**
 * Prints the settings that silently change behaviour when a host is missing an env var.
 * Without this, a wrong NODE_ENV only shows up as odd runtime behaviour much later.
 */
function reportConfig() {
  logger.info(
    `Config: NODE_ENV=${env.nodeEnv} otpDevMode=${env.otp.devMode} ` +
      `paymentDevMode=${env.payment.devMode} exposeErrorStack=${env.exposeErrorStack} ` +
      `corsOrigins=${env.clientOrigins.join(',')}`
  );

  if (env.jwt.accessSecret === 'dev-access-secret' || env.jwt.refreshSecret === 'dev-refresh-secret') {
    logger.warn(
      'JWT secrets are the built-in development defaults — anyone who knows them can forge ' +
        'tokens for any account. Set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.'
    );
  }
  if (!env.isProd) {
    logger.warn(
      `NODE_ENV is "${env.nodeEnv}", not "production" — development fallbacks are active. ` +
        'Set NODE_ENV=production on your host if this is a deployment.'
    );
  }
}

async function bootstrap() {
  reportConfig();
  await connectDB();

  const app = createApp();
  const server = http.createServer(app);
  initSocket(server);

  // Bind to 0.0.0.0 so the platform's proxy (Render, etc.) can reach the server.
  server.listen(env.port, '0.0.0.0', () => {
    logger.info(`QuickBite API listening on port ${env.port} (${env.nodeEnv})`);
    logger.info('Socket.IO ready');
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
