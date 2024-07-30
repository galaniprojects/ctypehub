import { initializeDatabase, trackDatabaseConnection } from './sequelize';
import { initKilt } from './initKilt';
// import { watchSubScan } from './watchSubScan';
import { watchIndexer } from './indexer/watchIndexer';

export async function initialize() {
  await initializeDatabase();
  await initKilt();

  trackDatabaseConnection();
  // watchSubScan(); // don't use subscan
  watchIndexer();
}
