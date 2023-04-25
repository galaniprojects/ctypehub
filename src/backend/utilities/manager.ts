import { server as hapiServer } from '@hapi/hapi';
import { createManager } from 'exiting';

import { configuration } from './configuration';

const { isProduction, port, baseUri } = configuration;

export const server = hapiServer({
  port,
  host: '127.0.0.1',
  uri: baseUri,
  debug: isProduction ? false : undefined,
  routes: { security: true },
});

export const manager = createManager(server);
