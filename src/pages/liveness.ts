import { blockchainConnectionState, initKilt } from '../utilities/initKilt';
import { watchForCTypes } from '../utilities/scanCTypes';
import {
  databaseConnectionState,
  trackDatabaseConnection,
} from '../utilities/sequelize';

(async () => {
  trackDatabaseConnection();
  await initKilt();
  watchForCTypes();
})();

export async function get() {
  const result =
    !databaseConnectionState.isOffForTooLong() &&
    !blockchainConnectionState.isOffForTooLong();
  return { body: String(result) };
}
