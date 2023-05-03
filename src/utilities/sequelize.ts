import { Sequelize } from 'sequelize';

import CType from '../models/ctype';

import { LastBlockScanned } from '../models/lastBlockScanned';

import { configuration } from './configuration';
import { logger } from './logger';
import { trackConnectionState } from './trackConnectionState';

let sequelizeInstance: Sequelize;

function getSequelize() {
  if (!sequelizeInstance) {
    sequelizeInstance = new Sequelize(configuration.databaseUri, {
      logging: (sql) => logger.trace(sql),
    });
  }

  return sequelizeInstance;
}

export async function initModels() {
  const sequelize = getSequelize();

  CType.initTable(sequelize);
  LastBlockScanned.initTable(sequelize);

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
  const sequelize = getSequelize();

  setInterval(async () => {
    try {
      await checkDatabaseConnection(sequelize);
    } catch {}
  }, 60 * 1000);
}
