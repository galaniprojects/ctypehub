import { initializeDatabase, trackDatabaseConnection } from './sequelize';
import { initKilt } from './initKilt';
// import { watchSubScan } from './watchSubScan';
import { queryFromIndexer } from './indexer/queryFromIndexer';

export async function initialize() {
  await initializeDatabase();
  await initKilt();

  await queryFromIndexer('foo');

  trackDatabaseConnection();
  // watchSubScan(); // don't use subscan
}
