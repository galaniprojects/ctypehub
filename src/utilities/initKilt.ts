import { connect } from '@kiltprotocol/sdk-js';
import { memoize } from 'lodash-es';

import { configuration } from './configuration';
import { logger } from './logger';
import { trackConnectionState } from './trackConnectionState';

export const initKilt = memoize(async () => {
  const api = await connect(configuration.blockchainEndpoint);
  api.on('disconnected', disconnectHandler);
  api.on('connected', () => blockchainConnectionState.on());
  api.on('error', (error) => logger.error(error));
  blockchainConnectionState.on();
});

export const blockchainConnectionState = trackConnectionState(60 * 1000);

export async function disconnectHandler(value?: string) {
  blockchainConnectionState.off();
  logger.warn(value, 'Received disconnect event from the blockchain');
}
