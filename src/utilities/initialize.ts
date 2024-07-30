import { initializeDatabase, trackDatabaseConnection } from './sequelize';
import { initKilt } from './initKilt';
import { watchIndexer } from './indexer/watchIndexer';

export async function initialize() {
  await initializeDatabase();
  await initKilt();

  trackDatabaseConnection();
  watchIndexer();
}
