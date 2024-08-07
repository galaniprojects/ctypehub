import { type ICType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../../models/ctype';

import { logger } from '../logger';

import { matchesGenerator } from './queryFromIndexer';

export async function updateAttestationsCount() {
  const fields = ['cTypeId: id', 'attestationsCreated', 'registrationBlockId'];

  const queryParams = {
    entity: 'cTypes',
    alias: 'attestationsCount',
    fields,
  };

  interface QueriedAttestationCount {
    cTypeId: ICType['$id'];
    attestationsCreated: number;
    registrationBlockId: string; // Block Ordinal Number, without punctuation
  }
  const entitiesGenerator =
    matchesGenerator<QueriedAttestationCount>(queryParams);

  for await (const entity of entitiesGenerator) {
    const { cTypeId, attestationsCreated } = entity;

    const cTypeToUpdate = await CTypeModel.findOne({
      where: {
        id: {
          [Op.eq]: cTypeId,
        },
        attestationsCount: {
          [Op.ne]: attestationsCreated,
        },
      },
    });

    if (!cTypeToUpdate) {
      continue;
    }

    logger.info(
      `Updating Attestation Count of cType "${cTypeToUpdate.getDataValue('id')}" from ${cTypeToUpdate.getDataValue('attestationsCount')} to ${attestationsCreated}`,
    );
    cTypeToUpdate.set('attestationsCount', attestationsCreated);
    await cTypeToUpdate.save();
  }
}
