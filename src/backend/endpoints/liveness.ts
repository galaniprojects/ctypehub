import { ServerRoute } from '@hapi/hapi';

import {
  checkDatabaseConnection,
  databaseConnectionState,
  trackDatabaseConnection,
} from '../utilities/sequelize';

export async function testLiveness() {
  await checkDatabaseConnection();
  trackDatabaseConnection();
}

function handler() {
  return !databaseConnectionState.isOffForTooLong();
}

export const liveness: ServerRoute = {
  method: 'GET',
  path: '/liveness',
  options: { auth: false },
  handler,
};
