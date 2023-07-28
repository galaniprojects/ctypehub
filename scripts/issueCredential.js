// Usage: OWNER=<your did> node scripts/issueCredential.js

import { readFile } from 'node:fs/promises';

import {
  Attestation,
  Blockchain,
  Claim,
  ConfigService,
  connect,
  Credential,
  CType,
  Did,
  disconnect,
  Utils,
} from '@kiltprotocol/sdk-js';

const { OWNER } = process.env;

const {
  BLOCKCHAIN_ENDPOINT,
  DID,
  SECRET_PAYER_MNEMONIC,
  SECRET_ASSERTION_METHOD_MNEMONIC,
} = Object.fromEntries(
  (await readFile('./.env', 'utf8'))
    .split('\n')
    .map((line) => line.split('=', 2)),
);

await connect(BLOCKCHAIN_ENDPOINT);

const ctype = CType.fromProperties('Authorized', {});
const claim = Claim.fromCTypeAndClaimContents(ctype, {}, OWNER);
const credential = Credential.fromClaim(claim);
const { cTypeHash, claimHash, delegationId } = Attestation.fromCredentialAndDid(
  credential,
  DID,
);

const api = ConfigService.get('api');
const tx = api.tx.attestation.add(claimHash, cTypeHash, delegationId);

const payer = Utils.Crypto.makeKeypairFromUri(SECRET_PAYER_MNEMONIC);
const assertionMethod = Utils.Crypto.makeKeypairFromUri(
  SECRET_ASSERTION_METHOD_MNEMONIC,
);
const authorizedTx = await Did.authorizeTx(
  DID,
  tx,
  async ({ data }) => ({
    signature: assertionMethod.sign(data, { withType: false }),
    keyType: assertionMethod.type,
  }),
  payer.address,
);

const sporranCredential = {
  credential,
  name: 'CTypeHub',
  cTypeTitle: 'CTypeHub',
  attester: 'CTypeHub',
  status: 'pending',
};

console.log('Your credential:', JSON.stringify(sporranCredential, null, 2));
console.log('Storing it on the blockchain...');
await Blockchain.signAndSubmitTx(authorizedTx, payer);

console.log('Done!');
await disconnect();
