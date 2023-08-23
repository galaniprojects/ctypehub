import { CType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../models/ctype';

import { logger } from './logger';
import { subScanEventGenerator } from './subScan';

export type EventParams = [
  { type_name: 'CTypeCreatorOf'; value: `0x${string}` },
  { type_name: 'CTypeHashOf'; value: `0x${string}` },
];

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
  const eventGenerator = subScanEventGenerator(
    'ctype',
    'CTypeCreated',
    fromBlock,
  );

  for await (const event of eventGenerator) {
    const { blockTimestampMs, params, extrinsicHash } = event;
    const cTypeHash = params[1].value;

    let cTypeDetails: CType.ICTypeDetails;
    try {
      cTypeDetails = await CType.fetchFromChain(CType.hashToId(cTypeHash));
    } catch (exception) {
      logger.error(exception, `Error fetching CType ${cTypeHash}`);
      continue;
    }

    if ('$id' in cTypeDetails) {
      // TODO: remove this `if` once the Spiritnet is updated
      const {
        $id,
        $schema,
        createdAt: block,
        ...rest
      } = cTypeDetails as unknown as CType.ICTypeDetails['cType'] &
        CType.ICTypeDetails;

      await CTypeModel.upsert({
        id: $id,
        schema: $schema,
        createdAt: new Date(blockTimestampMs),
        extrinsicHash,
        block: block.toString(),
        ...rest,
      });
      continue;
    }

    const { $id, $schema, ...rest } = cTypeDetails.cType;
    const { creator, createdAt: block } = cTypeDetails;

    await CTypeModel.upsert({
      id: $id,
      schema: $schema,
      createdAt: new Date(blockTimestampMs),
      creator,
      extrinsicHash,
      block: block.toString(),
      ...rest,
    });
  }
}
