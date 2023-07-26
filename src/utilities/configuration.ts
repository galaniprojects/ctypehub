import { cwd } from 'node:process';
import path from 'node:path';

import type { DidUri } from '@kiltprotocol/sdk-js';

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

const did = import.meta.env.DID as DidUri;
if (!did) {
  throw new ConfigurationError('DID is not provided');
}
const authenticationMnemonic = import.meta.env.SECRET_AUTHENTICATION_MNEMONIC;
if (!authenticationMnemonic) {
  throw new ConfigurationError(
    'SECRET_AUTHENTICATION_MNEMONIC is not provided',
  );
}
const assertionMethodMnemonic = import.meta.env
  .SECRET_ASSERTION_METHOD_MNEMONIC;
if (!assertionMethodMnemonic) {
  throw new ConfigurationError(
    'SECRET_ASSERTION_METHOD_MNEMONIC is not provided',
  );
}
const keyAgreementMnemonic = import.meta.env.SECRET_KEY_AGREEMENT_MNEMONIC;
if (!keyAgreementMnemonic) {
  throw new ConfigurationError('SECRET_KEY_AGREEMENT_MNEMONIC is not provided');
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
  did,
  authenticationMnemonic,
  assertionMethodMnemonic,
  keyAgreementMnemonic,
};
