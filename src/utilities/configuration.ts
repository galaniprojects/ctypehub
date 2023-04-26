import { cwd } from 'node:process';
import path from 'node:path';

import { pino } from 'pino';

const env = import.meta.env;

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    pino().fatal(message);
    process.exit(1);
  }
}

const baseUri = env.URL;
if (!baseUri) {
  throw new ConfigurationError('No base URI provided');
}

const httpAuthPassword = env.SECRET_HTTP_AUTH_PASSWORD;

export const configuration = {
  port: env.PORT || 3000,
  baseUri,
  isProduction: env.PROD,
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  httpAuthPassword,
  databaseUri:
    env.DATABASE_URI || 'postgres://postgres:postgres@localhost:5432/postgres',
};
