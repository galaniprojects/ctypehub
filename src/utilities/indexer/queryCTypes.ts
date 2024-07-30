import { type DidUri, type HexString, type ICType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../../models/ctype';

import { logger } from '../logger';

import { matchesGenerator } from './queryFromIndexer';
import { DidNames, wholeBlock } from './fragments';

export async function scanCTypes() {
  const latestCType = await CTypeModel.findOne({
    order: [['createdAt', 'DESC']],
    where: {
      block: {
        [Op.not]: null,
      },
    },
  });

  const fromBlock = latestCType ? Number(latestCType.dataValues.block) : 0;

  const writtenQuery = `
  query {
    cTypes(
      filter: { registrationBlock: { id: { greaterThan: "${fromBlock}" } } }
      orderBy: REGISTRATION_BLOCK_ID_ASC
    ) {
      totalCount
      nodes {
        id
        author {
          ...DidNames
        }
        registrationBlock {
          ...wholeBlock
        }
        attestationsCreated
        attestationsRevoked
        attestationsRemoved
        validAttestations
        definition
      }
    }
  }
    ${wholeBlock}
    ${DidNames}
  `;

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
  const entitiesGenerator = matchesGenerator(writtenQuery);

  for await (const entity of entitiesGenerator) {
    const {
      id: cTypeId,
      author,
      registrationBlock,
      definition,
    } = entity as unknown as QueriedCType;
    // const cTypeHash = cTypeId.split(':')[2] as HexString;
    const { id: creator } = author;

    // const { blockTimestampMs, extrinsicHash } = event;
    // const params = event.parsedParams;
    // const cTypeHash = params.CtypeHashOf as HexString;

    const { $schema, ...rest } = JSON.parse(definition) as Omit<ICType, '$id'>;
    // const { $id, $schema, ...rest } = cTypeDetails.cType;

    const newCType = await CTypeModel.upsert({
      id: cTypeId,
      schema: $schema,
      createdAt: new Date(registrationBlock.timeStamp),
      creator,
      extrinsicHash:
        '0xdbb285e26e9c214dc70ffbe8cb1e04a2dec19161f4ba6314b9828252accf3c50', // foo until deleting this field
      block: registrationBlock.id,
      ...rest,
    });
    logger.info(`Added new CType to data base: ${JSON.stringify(newCType)}`);
  }
}
