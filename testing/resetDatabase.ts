import { CType } from '../src/models/ctype';
import { Attestation } from '../src/models/attestation';

export async function resetDatabase() {
  await Attestation.destroy({ where: {} });
  await CType.destroy({ where: {} });
}
