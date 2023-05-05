import { blockchainConnectionState, initKilt } from '../utilities/initKilt';
import { watchForCTypes } from '../utilities/scanCTypes';
import {
  databaseConnectionState,
  initModels,
  trackDatabaseConnection,
} from '../utilities/sequelize';

(async () => {
  trackDatabaseConnection();
  await initModels();
  await initKilt();
  watchForCTypes();
})();

export async function get() {
  const result =
    !databaseConnectionState.isOffForTooLong() &&
    !blockchainConnectionState.isOffForTooLong();
  return { body: String(result) };
}
