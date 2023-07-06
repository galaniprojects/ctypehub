import { Blockchain, Did, Utils } from '@kiltprotocol/sdk-js';

import { endowAccount } from './endowAccount';

export async function createDid() {
  const authentication = Utils.Crypto.makeKeypairFromSeed();
  await endowAccount(authentication.address);
  const assertionMethod = Utils.Crypto.makeKeypairFromSeed();

  const tx = await Did.getStoreTx(
    {
      authentication: [authentication],
      assertionMethod: [assertionMethod],
    },
    authentication.address,
    async ({ data }) => ({
      signature: authentication.sign(data, { withType: false }),
      keyType: authentication.type,
    }),
  );
  await Blockchain.signAndSubmitTx(tx, authentication);

  const did = Did.getFullDidUri(authentication.address);

  return { assertionMethod, did };
}
