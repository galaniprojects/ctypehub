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

    const [affectedCount] = await CTypeModel.update(
      { attestationsCreated },
      {
        where: {
          id: {
            [Op.eq]: cTypeId,
          },
          attestationsCreated: {
            [Op.ne]: attestationsCreated,
          },
        },
      },
    );

    if (affectedCount !== 0) {
      logger.info(
        `Updating count of Attestation Created of cType "${cTypeId}" to ${attestationsCreated}`,
      );
    }
  }
}
