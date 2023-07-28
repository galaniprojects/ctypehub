import { Blockchain, ConfigService, CType, Did } from '@kiltprotocol/sdk-js';
import { memoize } from 'lodash-es';

import { configuration } from '../configuration';
import { initKilt } from '../initKilt';
import { logger } from '../logger';

import { getKeypairs } from './getKeypairs';
import { signWithAssertionMethod } from './cryptoCallbacks';

const cType = CType.fromProperties('Authorized', {});

export const getAuthorizedCType = memoize(async () => {
  await initKilt();
  const api = ConfigService.get('api');

  if ((await api.query.ctype.ctypes(CType.idToChain(cType.$id))).isSome) {
    logger.info('Authorized CType is already on the blockchain');
    return cType;
  }

  logger.warn('Storing Authorized CType on the blockchain');

  const { payer } = await getKeypairs();

  const extrinsic = await Did.authorizeTx(
    configuration.did,
    api.tx.ctype.add(CType.toChain(cType)),
    signWithAssertionMethod,
    payer.address,
  );

  await Blockchain.signAndSubmitTx(extrinsic, payer);

  logger.warn(cType, 'Authorized CType');
  return cType;
});
