import { cwd } from 'node:process';
import path from 'node:path';

import { pino } from 'pino';

import * as env from './env';

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    pino().fatal(message);
    process.exit(1);
  }
}

const subscan = {
  network: env.SUBSCAN_NETWORK,
  secret: env.SECRET_SUBSCAN,
};
if (!subscan.network) {
  throw new ConfigurationError('No subscan network provided');
}
if (!subscan.secret) {
  throw new ConfigurationError('No subscan secret provided');
}

const blockchainEndpoint = env.BLOCKCHAIN_ENDPOINT;
if (!blockchainEndpoint) {
  throw new ConfigurationError('No blockchain endpoint provided');
}

export const configuration = {
  port: env.PORT || 3000,
  isProduction: env.PROD,
  isTest: env.MODE === 'test',
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  databaseUri:
    env.DATABASE_URI || 'postgres://postgres:postgres@localhost:5432/postgres',
  subscan,
  blockchainEndpoint,
};
