import { type ICType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../../models/ctype';

import { logger } from '../logger';

import { matchesGenerator } from './queryFromIndexer';

interface QueriedAttestationCount {
  cTypeId: ICType['$id'];
  attestationsCreated: number;
  registrationBlockId: string; // Block Ordinal Number, without punctuation
}

export async function updateAttestationsCreated() {
  const fields = ['cTypeId: id', 'attestationsCreated', 'registrationBlockId'];

  const queryParams = {
    entity: 'cTypes',
    alias: 'attestationsCreated',
    fields,
  };

  const entitiesGenerator =
    matchesGenerator<QueriedAttestationCount>(queryParams);

  for await (const entity of entitiesGenerator) {
    const { cTypeId, attestationsCreated } = entity;

    const cTypeToUpdate = await CTypeModel.findOne({
      where: {
        id: {
          [Op.eq]: cTypeId,
        },
        attestationsCreated: {
          [Op.ne]: attestationsCreated,
        },
      },
    });

    if (!cTypeToUpdate) {
      continue;
    }

    logger.info(
      `Updating Attestation Count of cType "${cTypeToUpdate.getDataValue('id')}" from ${cTypeToUpdate.getDataValue('attestationsCreated')} to ${attestationsCreated}`,
    );
    cTypeToUpdate.set('attestationsCreated', attestationsCreated);
    await cTypeToUpdate.save();
  }
}
