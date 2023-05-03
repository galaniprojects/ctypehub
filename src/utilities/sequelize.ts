import { Sequelize } from 'sequelize';

import { CType, CTypeModelDefinition } from '../models/ctype';

import { configuration } from './configuration';
import { logger } from './logger';
import { trackConnectionState } from './trackConnectionState';

export const sequelize = new Sequelize(configuration.databaseUri, {
  logging: (sql) => logger.trace(sql),
});

export async function initModels() {
  CType.init(CTypeModelDefinition, { sequelize });

  await sequelize.sync();
}

export const databaseConnectionState = trackConnectionState(2 * 60 * 1000);

export async function checkDatabaseConnection(sequelize: Sequelize) {
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
      await checkDatabaseConnection(sequelize);
    } catch {}
  }, 60 * 1000);
}
