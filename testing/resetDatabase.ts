import { CType } from '../src/models/ctype';
import { Attestation } from '../src/models/attestation';
import { Tag } from '../src/models/tag';

export async function resetDatabase() {
  await Attestation.destroy({ where: {} });
  await Tag.destroy({ where: {} });
  await CType.destroy({ where: {} });
}
