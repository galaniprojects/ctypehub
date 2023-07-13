import { blockchainConnectionState, initKilt } from '../utilities/initKilt';
import { watchSubScan } from '../utilities/watchSubScan';
import {
  databaseConnectionState,
  trackDatabaseConnection,
} from '../utilities/sequelize';

(async () => {
  trackDatabaseConnection();
  await initKilt();
  watchSubScan();
})();

export async function get() {
  const result =
    !databaseConnectionState.isOffForTooLong() &&
    !blockchainConnectionState.isOffForTooLong();
  return { body: String(result) };
}
