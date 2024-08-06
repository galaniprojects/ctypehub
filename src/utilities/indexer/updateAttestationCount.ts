import { type ICType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../../models/ctype';

import { logger } from '../logger';

import { matchesGenerator } from './queryFromIndexer';
import { writeQuery } from './writeQuery';

export async function updateAttestationsCount() {
  // When modifying this query, first try it out on the https://indexer.kilt.io/ (or dev-indexer) and click on "Prettify"
  // const writtenQuery = `
  // query {
  //   attestationsCount: cTypes(orderBy: ID_ASC, first: ${QUERY_SIZE}, offset: 0 ) {
  //   # It does not matter what the order criterion is as long as it is consistent.
  //     totalCount
  //     nodes {
  //       cTypeId: id
  //       attestationsCreated
  //       registrationBlockId
  //     }
  //   }
  // }
  // `;
  const fields = ['cTypeId: id', 'attestationsCreated', 'registrationBlockId'];
  const writtenQuery = writeQuery({
    entity: 'cTypes',
    alias: 'attestationsCount',
    fields,
  });

  interface QueriedAttestationCount {
    cTypeId: ICType['$id'];
    attestationsCreated: number;
    registrationBlockId: string; // Block Ordinal Number, without punctuation
  }
  const entitiesGenerator = matchesGenerator(writtenQuery);

  for await (const entity of entitiesGenerator) {
    const { cTypeId, attestationsCreated } =
      entity as unknown as QueriedAttestationCount;

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
    cTypeToUpdate.set('attestationsCount', attestationsCreated.toString(10));
    await cTypeToUpdate.save();
  }
}
