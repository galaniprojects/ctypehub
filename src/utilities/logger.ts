import { LoggerOptions, pino } from 'pino';

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
