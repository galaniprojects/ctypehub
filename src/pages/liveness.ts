import {
  databaseConnectionState,
  trackDatabaseConnection,
} from '../utilities/sequelize';

trackDatabaseConnection();

export async function get() {
  const result = !databaseConnectionState.isOffForTooLong();
  return { body: String(result) };
}
