import { CType } from '../src/models/ctype';
import { Tag } from '../src/models/tag';
import { sequelize } from '../src/utilities/sequelize';

export async function resetDatabase() {
  await sequelize.sync();
  await Tag.destroy({ where: {} });
  await CType.destroy({ where: {} });
}
