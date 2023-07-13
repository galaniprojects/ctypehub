import { CType } from '../src/models/ctype';
import { Attestation } from '../src/models/attestation';
import { Tag } from '../src/models/tag';
import { sequelize } from '../src/utilities/sequelize';

export async function resetDatabase() {
  await sequelize.sync();
  await Attestation.destroy({ where: {} });
  await Tag.destroy({ where: {} });
  await CType.destroy({ where: {} });
}
