import { Sequelize } from 'sequelize';

import { Tag, TagModelDefinition } from '../models/tag';

import { CType, CTypeModelDefinition } from '../models/ctype';

import { configuration } from './configuration';
import { logger } from './logger';
import { trackConnectionState } from './trackConnectionState';

export const sequelize = new Sequelize(configuration.databaseUri, {
  logging: (sql) => logger.trace(sql),
});

(() => {
  CType.init(CTypeModelDefinition, { sequelize });
  Tag.init(TagModelDefinition, { sequelize });
  Tag.belongsToMany(CType, { through: 'CTypeTags' });
  CType.belongsToMany(Tag, { through: 'CTypeTags' });
  sequelize.sync();
})();

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
