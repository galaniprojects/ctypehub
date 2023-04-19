import inert from '@hapi/inert';

import { exitOnError } from './utilities/exitOnError';
import { manager, server } from './utilities/manager';
import { hapiLogger } from './utilities/logger';
import { configureDevErrors } from './utilities/configureDevErrors';
import { configuration } from './utilities/configuration';

(async () => {
  await server.register(inert);
  await server.register(hapiLogger);

  await configureDevErrors(server);
  server.logger.info('Server configured');

  server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
      directory: {
        path: configuration.distFolder,
      },
    },
    options: {
      tags: ['noLogs'],
    },
  });
  server.logger.info('Routes configured');

  await manager.start();
})().catch(exitOnError);
