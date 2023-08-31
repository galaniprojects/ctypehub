import {
  Blockchain,
  ConfigService,
  CType,
  Did,
  type DidUri,
  type KiltKeyringPair,
} from '@kiltprotocol/sdk-js';

export async function createCType(
  did: DidUri,
  assertionMethod: KiltKeyringPair,
  submitter: KiltKeyringPair,
) {
  const cType = CType.fromProperties(Math.random().toString(), {
    Email: {
      type: 'string',
    },
  });

  const api = ConfigService.get('api');
  const tx = api.tx.ctype.add(CType.toChain(cType));

  const extrinsic = await Did.authorizeTx(
    did,
    tx,
    async ({ data }) => ({
      signature: assertionMethod.sign(data, { withType: false }),
      keyType: assertionMethod.type,
    }),
    submitter.address,
  );

  await Blockchain.signAndSubmitTx(extrinsic, submitter);

  return { cType, extrinsic };
}
