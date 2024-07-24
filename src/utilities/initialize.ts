import { initializeDatabase, trackDatabaseConnection } from './sequelize';
import { initKilt } from './initKilt';
// import { watchSubScan } from './watchSubScan';
import { queryFromIndexer } from './indexer/queryFromIndexer';

export async function initialize() {
  await initializeDatabase();
  await initKilt();

  await queryFromIndexer();

  trackDatabaseConnection();
  // watchSubScan(); // don't use subscan
}
