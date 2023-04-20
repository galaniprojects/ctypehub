import { server as hapiServer } from '@hapi/hapi';
import { createManager } from 'exiting';

import { configuration } from './configuration';

const { isProduction, port, host } = configuration;

export const server = hapiServer({
  port,
  host,
  debug: isProduction ? false : undefined,
  routes: { security: true },
});

export const manager = createManager(server);
