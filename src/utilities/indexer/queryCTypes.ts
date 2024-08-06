import { type DidUri, type HexString, type ICType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../../models/ctype';

import { logger } from '../logger';

import { matchesGenerator } from './queryFromIndexer';
import { DidNames, wholeBlock } from './fragments';

export async function queryCTypes() {
  const latestCType = await CTypeModel.findOne({
    order: [['createdAt', 'DESC']],
    where: {
      block: {
        [Op.not]: null,
      },
    },
  });

  const fromDate = latestCType ? latestCType.dataValues.createdAt : new Date(0);

  // When modifying queries, first try them out on https://indexer.kilt.io/ or https://dev-indexer.kilt.io/

  const fieldsToQuery = [
    'id',
    'author {...DidNames}',
    `registrationBlock {...wholeBlock}`,
    'attestationsCreated',
    'attestationsRevoked',
    'attestationsRemoved',
    'validAttestations',
    'definition',
  ];
  const queryParams = {
    entity: 'cTypes',
    fields: fieldsToQuery,
    filter: `{ registrationBlock: { timeStamp: { greaterThan: "${fromDate.toISOString()}" } } }`,
    fragments: [wholeBlock, DidNames],
  };

  type ISO8601DateString = string; // like 2022-02-09T13:09:18.217

  interface QueriedCType {
    id: ICType['$id'];
    attestationsCreated: number;
    author: {
      id: DidUri;
      web3NameId: string;
    };
    registrationBlock: {
      id: string; // Block Ordinal Number, without punctuation
      hash: HexString;
      timeStamp: ISO8601DateString;
    };
    definition: string; // stringified JSON of cType Schema
  }
  const entitiesGenerator = matchesGenerator<QueriedCType>(queryParams);

  for await (const entity of entitiesGenerator) {
    const {
      id: cTypeId,
      author,
      registrationBlock,
      definition,
      attestationsCreated,
    } = entity;

    const { id: creator } = author;
    const { $schema, ...rest } = JSON.parse(definition) as Omit<ICType, '$id'>;

    const newCType = await CTypeModel.upsert({
      id: cTypeId,
      schema: $schema,
      createdAt: new Date(registrationBlock.timeStamp + 'Z'),
      creator,
      block: registrationBlock.id,
      ...rest,
      attestationsCount: attestationsCreated.toString(10),
    });
    logger.info(
      `Added new CType to data base: ${JSON.stringify(newCType, null, 2)}`,
    );
  }
}
