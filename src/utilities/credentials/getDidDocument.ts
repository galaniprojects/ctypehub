import {
  Did,
  DidDocument,
  KeyRelationship,
  KiltKeyringPair,
  Utils,
} from '@kiltprotocol/sdk-js';
import { memoize } from 'lodash-es';

import { configuration } from '../configuration';
import { initKilt } from '../initKilt';

import { getKeypairs } from './getKeypairs';

async function compareKeys(
  configured: Pick<KiltKeyringPair, 'publicKey'>,
  resolved: Pick<KiltKeyringPair, 'publicKey'> | undefined,
  relationship: KeyRelationship,
): Promise<void> {
  if (!resolved) {
    throw new Error(
      `Your on-chain DID is broken: the resolved key for ${relationship} is undefined`,
    );
  }

  const derivedHex = Utils.Crypto.u8aToHex(configured.publicKey);
  const resolvedHex = Utils.Crypto.u8aToHex(resolved.publicKey);

  if (derivedHex !== resolvedHex) {
    throw new Error(
      `Your on-chain DID is broken: the configured key for ${relationship} does not match resolved one`,
    );
  }
}

async function compareAllKeys(fullDid: DidDocument): Promise<void> {
  const keypairs = await getKeypairs();

  await compareKeys(
    keypairs.authentication,
    fullDid.authentication[0],
    'authentication',
  );
  await compareKeys(
    keypairs.assertionMethod,
    fullDid.assertionMethod?.[0],
    'assertionMethod',
  );
  await compareKeys(
    keypairs.keyAgreement,
    fullDid.keyAgreement?.[0],
    'keyAgreement',
  );
}

export const getDidDocument = memoize(async () => {
  await initKilt();

  const { did } = configuration;

  const resolved = await Did.resolve(did);
  if (!resolved || !resolved.document) {
    throw new Error(`Could not resolve the configured DID ${did}`);
  }

  const { document } = resolved;
  await compareAllKeys(document);

  const assertionMethodKey = document.assertionMethod?.[0];
  if (!assertionMethodKey) {
    throw new Error('Impossible: assertion method key not found');
  }

  const keyAgreementKey = document.keyAgreement?.[0];
  if (!keyAgreementKey) {
    throw new Error('Impossible: key agreement key not found');
  }

  return {
    did,
    didDocument: document,
    keyAgreementKey,
    assertionMethodKey,
  };
});
