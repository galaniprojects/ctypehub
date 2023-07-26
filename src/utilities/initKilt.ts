import { connect } from '@kiltprotocol/sdk-js';

import { configuration } from './configuration';
import { logger } from './logger';
import { trackConnectionState } from './trackConnectionState';

async function initKiltInternal(): Promise<void> {
  const api = await connect(configuration.blockchainEndpoint);
  api.on('disconnected', disconnectHandler);
  api.on('connected', () => blockchainConnectionState.on());
  api.on('error', (error) => logger.error(error));
}

let initPromise: Promise<void> | undefined;

export async function initKilt() {
  if (!initPromise) {
    initPromise = initKiltInternal();
  }
  return initPromise;
}

export const blockchainConnectionState = trackConnectionState(60 * 1000);

export async function disconnectHandler(value?: string) {
  blockchainConnectionState.off();
  logger.warn(value, 'Received disconnect event from the blockchain');
}
