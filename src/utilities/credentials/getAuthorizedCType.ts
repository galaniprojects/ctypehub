import {
  Blockchain,
  ConfigService,
  CType,
  Did,
  ICType,
} from '@kiltprotocol/sdk-js';

import { configuration } from '../configuration';
import { initKilt } from '../initKilt';
import { logger } from '../logger';

import { keypairsPromise } from './keypairs';
import { signWithAssertionMethod } from './cryptoCallbacks';

const cType = CType.fromProperties('Authorized', {});

async function getAuthorizedCTypeInternal() {
  await initKilt();
  const api = ConfigService.get('api');

  if ((await api.query.ctype.ctypes(CType.idToChain(cType.$id))).isSome) {
    logger.info('Authorized CType is already on the blockchain');
    return cType;
  }

  logger.warn('Storing Authorized CType on the blockchain');

  const { payer } = await keypairsPromise;

  const extrinsic = await Did.authorizeTx(
    configuration.did,
    api.tx.ctype.add(CType.toChain(cType)),
    signWithAssertionMethod,
    payer.address,
  );

  await Blockchain.signAndSubmitTx(extrinsic, payer);

  logger.warn(cType, 'Authorized CType');
  return cType;
}

let promise: Promise<ICType> | undefined;

export async function getAuthorizedCType() {
  if (!promise) {
    promise = getAuthorizedCTypeInternal();
  }
  return promise;
}
