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
const indexer = {
  graphqlEndpoint: import.meta.env.GRAPHQL_ENDPOINT as string,
};
if (!indexer.graphqlEndpoint) {
  throw new ConfigurationError('No endpoint for the GraphQL server provided');
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

function deductW3nOrigin(blockchainEndpoint: string) {
  const endpoint = blockchainEndpoint.toLowerCase();
  if (endpoint.includes('peregrine-stg')) {
    return 'https://smoke.w3n.id';
  }
  if (endpoint.includes('peregrine')) {
    return 'https://test.w3n.id';
  }
  return 'https://w3n.id';
}

export const configuration = {
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
  distFolder: path.join(cwd(), 'dist', 'frontend'),
  databaseUri:
    (import.meta.env.DATABASE_URI as string) ||
    'postgres://postgres:postgres@localhost:5432/postgres',
  blockchainEndpoint,
  did,
  authenticationMnemonic,
  assertionMethodMnemonic,
  keyAgreementMnemonic,
  payerMnemonic,
  w3nOrigin: deductW3nOrigin(blockchainEndpoint),
  indexer,
};
