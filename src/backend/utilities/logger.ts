import { LoggerOptions, pino } from 'pino';
import hapiPino from 'hapi-pino';

import { configuration } from './configuration';

const { isProduction } = configuration;

const options: LoggerOptions = {
  level: isProduction ? 'debug' : 'trace',
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

export const hapiLogger = {
  plugin: hapiPino,
  options: {
    ...options,
    ignoreTags: ['noLogs'],
    logRequestComplete: isProduction,
  },
};
