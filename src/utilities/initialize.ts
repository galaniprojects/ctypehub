import { initializeDatabase, trackDatabaseConnection } from './sequelize';
import { initKilt } from './initKilt';
import { watchSubScan } from './watchSubScan';

export async function initialize() {
  await initializeDatabase();
  await initKilt();

  trackDatabaseConnection();
  watchSubScan();
}
