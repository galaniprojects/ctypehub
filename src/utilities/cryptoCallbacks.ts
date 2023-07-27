import {
  DecryptCallback,
  DidResourceUri,
  EncryptCallback,
  Utils,
} from '@kiltprotocol/sdk-js';

import { keypairsPromise } from './keypairs';
import { didDocumentPromise } from './didDocument';

export async function signWithAssertionMethod({ data }: { data: Uint8Array }) {
  const { assertionMethod } = await keypairsPromise;
  const { did, assertionMethodKey } = await didDocumentPromise;

  return {
    signature: assertionMethod.sign(data, { withType: false }),
    keyType: assertionMethodKey.type,
    keyUri: `${did}${assertionMethodKey.id}` as DidResourceUri,
  };
}

export async function encrypt({
  data,
  peerPublicKey,
}: Parameters<EncryptCallback>[0]) {
  const { keyAgreement } = await keypairsPromise;

  const { did, keyAgreementKey } = await didDocumentPromise;
  const keyUri: DidResourceUri = `${did}${keyAgreementKey.id}`;

  const { box, nonce } = Utils.Crypto.encryptAsymmetric(
    data,
    peerPublicKey,
    keyAgreement.secretKey,
  );

  return {
    data: box,
    nonce,
    keyUri,
  };
}

export async function decrypt({
  data: box,
  nonce,
  peerPublicKey,
}: Parameters<DecryptCallback>[0]) {
  const { keyAgreement } = await keypairsPromise;

  const data = Utils.Crypto.decryptAsymmetric(
    { box, nonce },
    peerPublicKey,
    keyAgreement.secretKey,
  );
  if (!data) {
    throw new Error('Failed to decrypt with given key');
  }

  return {
    data,
  };
}
