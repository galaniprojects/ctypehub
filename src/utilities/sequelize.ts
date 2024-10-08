import { Sequelize } from 'sequelize';

import { initCType } from '../models/ctype';
import { initTag } from '../models/tag';

import { configuration } from './configuration';
import { logger } from './logger';
import { trackConnectionState } from './trackConnectionState';

const sequelize = new Sequelize(configuration.databaseUri, {
  logging: (sql) => logger.trace(sql),
});

export { sequelize };

export const databaseConnectionState = trackConnectionState(2 * 60 * 1000);

async function checkDatabaseConnection() {
  try {
    await sequelize.authenticate();
    databaseConnectionState.on();
  } catch (error) {
    databaseConnectionState.off();
    logger.error(error, 'Database connection error');
  }
}

export function trackDatabaseConnection() {
  setInterval(async () => {
    try {
      await checkDatabaseConnection();
    } catch {}
  }, 60 * 1000);
}

export async function initializeDatabase() {
  initTag(sequelize);
  initCType(sequelize);
  await sequelize.sync();
}
