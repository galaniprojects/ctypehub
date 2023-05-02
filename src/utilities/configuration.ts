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

const subscan = {
  host: env.SUBSCAN_HOST,
  secret: env.SECRET_SUBSCAN,
};
if (!subscan.host || !subscan.secret) {
  throw new ConfigurationError('Subscan credentials missing');
}

const blockchainEndpoint = env.BLOCKCHAIN_ENDPOINT;
if (!blockchainEndpoint) {
  throw new ConfigurationError('No blockchain endpoint provided');
}

export const configuration = {
  port: env.PORT || 3000,
  baseUri,
  isProduction: env.PROD,
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  databaseUri:
    env.DATABASE_URI || 'postgres://postgres:postgres@localhost:5432/postgres',
  subscan,
  blockchainEndpoint,
};
