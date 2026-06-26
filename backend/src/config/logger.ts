/* Minimal structured logger — swap for pino/winston in production. */
type Level = 'info' | 'warn' | 'error' | 'debug';

function log(level: Level, msg: string, meta?: unknown) {
  const time = new Date().toISOString();
  const prefix = `[${time}] ${level.toUpperCase()}`;
  if (meta !== undefined) {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](`${prefix} ${msg}`, meta);
  } else {
    // eslint-disable-next-line no-console
    console[level === 'debug' ? 'log' : level](`${prefix} ${msg}`);
  }
}

export const logger = {
  info: (msg: string, meta?: unknown) => log('info', msg, meta),
  warn: (msg: string, meta?: unknown) => log('warn', msg, meta),
  error: (msg: string, meta?: unknown) => log('error', msg, meta),
  debug: (msg: string, meta?: unknown) => {
    if (process.env.NODE_ENV !== 'production') log('debug', msg, meta);
  },
};
