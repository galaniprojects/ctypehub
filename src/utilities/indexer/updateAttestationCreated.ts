import { type ICType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../../models/ctype';

import { logger } from '../logger';

import { matchesGenerator, QUERY_SIZE } from './queryFromIndexer';

interface QueriedAttestationCreated {
  cTypeId: ICType['$id'];
  attestationsCreated: number;
  registrationBlockId: string; // Block Ordinal Number, without punctuation
}

export async function updateAttestationsCreated() {
  // When modifying queries, first try them out on https://indexer.kilt.io/ or https://dev-indexer.kilt.io/
  const entitiesGenerator = matchesGenerator<QueriedAttestationCreated>(
    (offset) => `
      query {
        attestationsCreated: cTypes(orderBy: ID_ASC, first: ${QUERY_SIZE}, offset: ${offset}) {
          totalCount
          nodes {
            cTypeId: id
            attestationsCreated
            registrationBlockId
          }
        }
      }
    `,
  );

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
