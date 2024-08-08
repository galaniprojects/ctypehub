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
  network: import.meta.env.SUBSCAN_NETWORK as string,
  secret: import.meta.env.SECRET_SUBSCAN as string,
};
if (!subscan.network) {
  throw new ConfigurationError('No subscan network provided');
}
if (!subscan.secret) {
  throw new ConfigurationError('No subscan secret provided');
}
const indexer = {
  graphqlEndpoint: import.meta.env.GRAPHQL_ENDPOINT as string,
  polkadotRPCEndpoint: import.meta.env.POLKADOT_RPC_ENDPOINT as string,
};
if (!indexer.graphqlEndpoint) {
  throw new ConfigurationError('No endpoint for the GraphQL server provided');
}
if (!indexer.polkadotRPCEndpoint) {
  throw new ConfigurationError(
    'No R.P.C. endpoint for the polkadot.js explorer provided',
  );
}
const blockchainEndpoint = import.meta.env.BLOCKCHAIN_ENDPOINT as string;
if (!blockchainEndpoint) {
  throw new ConfigurationError('No blockchain endpoint provided');
}

const did = import.meta.env.DID as DidUri | undefined;
if (!did) {
  throw new ConfigurationError('DID is not provided');
}
const authenticationMnemonic = import.meta.env
  .SECRET_AUTHENTICATION_MNEMONIC as string;
if (!authenticationMnemonic) {
  throw new ConfigurationError(
    'SECRET_AUTHENTICATION_MNEMONIC is not provided',
  );
}
const assertionMethodMnemonic = import.meta.env
  .SECRET_ASSERTION_METHOD_MNEMONIC as string;
if (!assertionMethodMnemonic) {
  throw new ConfigurationError(
    'SECRET_ASSERTION_METHOD_MNEMONIC is not provided',
  );
}
const keyAgreementMnemonic = import.meta.env
  .SECRET_KEY_AGREEMENT_MNEMONIC as string;
if (!keyAgreementMnemonic) {
  throw new ConfigurationError('SECRET_KEY_AGREEMENT_MNEMONIC is not provided');
}
const payerMnemonic = import.meta.env.SECRET_PAYER_MNEMONIC as string;
if (!payerMnemonic) {
  throw new ConfigurationError('SECRET_PAYER_MNEMONIC is not provided');
}

const w3nOrigins: Record<string, string> = {
  'wss://peregrine.kilt.io': 'https://test.w3n.id',
  'wss://peregrine-stg.kilt.io/para': 'https://smoke.w3n.id',
  'wss://kilt-rpc.dwellir.com': 'https://w3n.id',
};

export const configuration = {
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  databaseUri:
    (import.meta.env.DATABASE_URI as string) ||
    'postgres://postgres:postgres@localhost:5432/postgres',
  subscan,
  blockchainEndpoint,
  did,
  authenticationMnemonic,
  assertionMethodMnemonic,
  keyAgreementMnemonic,
  payerMnemonic,
  w3nOrigin: w3nOrigins[blockchainEndpoint] || 'https://w3n.id',
  indexer,
};
