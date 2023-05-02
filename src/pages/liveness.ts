import { blockchainConnectionState, initKilt } from '../utilities/initKilt';
import { scanCTypes } from '../utilities/scanCTypes';
import {
  databaseConnectionState,
  initModels,
  trackDatabaseConnection,
} from '../utilities/sequelize';

(async () => {
  trackDatabaseConnection();
  await initModels();
  await initKilt();
  scanCTypes();
})();

export async function get() {
  const result =
    !databaseConnectionState.isOffForTooLong() &&
    !blockchainConnectionState.isOffForTooLong();
  return { body: String(result) };
}
