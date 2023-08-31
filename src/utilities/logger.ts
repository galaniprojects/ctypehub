import { type LoggerOptions, pino } from 'pino';

import { configuration } from './configuration';

const { isProduction, isTest } = configuration;

const options: LoggerOptions = {
  level: isTest ? 'warn' : 'debug',
  ...(!isProduction && { transport: { target: 'pino-pretty' } }),
  redact: isProduction
    ? [
        'req.headers.authorization',
        'req.headers["x-forwarded-for"]',
        'req.headers["x-real-ip"]',
      ]
    : { paths: ['req', 'res'], remove: true },
};

export const logger = pino(options);
