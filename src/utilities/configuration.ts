import { cwd } from 'node:process';
import path from 'node:path';

import { pino } from 'pino';

class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    pino().fatal(message);
    process.exit(1);
  }
}

const subscan = {
  network: import.meta.env.SUBSCAN_NETWORK,
  secret: import.meta.env.SECRET_SUBSCAN,
};
if (!subscan.network) {
  throw new ConfigurationError('No subscan network provided');
}
if (!subscan.secret) {
  throw new ConfigurationError('No subscan secret provided');
}

const blockchainEndpoint = import.meta.env.BLOCKCHAIN_ENDPOINT;
if (!blockchainEndpoint) {
  throw new ConfigurationError('No blockchain endpoint provided');
}

export const configuration = {
  port: import.meta.env.PORT || 3000,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  databaseUri:
    import.meta.env.DATABASE_URI ||
    'postgres://postgres:postgres@localhost:5432/postgres',
  subscan,
  blockchainEndpoint,
};
