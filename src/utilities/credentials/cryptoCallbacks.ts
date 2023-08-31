import {
  type DecryptCallback,
  type DidResourceUri,
  type EncryptCallback,
  Utils,
} from '@kiltprotocol/sdk-js';

import { getKeypairs } from './getKeypairs';
import { getDidDocument } from './getDidDocument';

export async function signWithAssertionMethod({ data }: { data: Uint8Array }) {
  const { assertionMethod } = await getKeypairs();
  const { did, assertionMethodKey } = await getDidDocument();

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
  const { keyAgreement } = await getKeypairs();

  const { did, keyAgreementKey } = await getDidDocument();
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
  const { keyAgreement } = await getKeypairs();

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
