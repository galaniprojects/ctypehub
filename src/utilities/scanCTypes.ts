import { CType, type HexString } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../models/ctype';

import { logger } from './logger';
import { subScanEventGenerator, type ParsedEvent } from './subScan';

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
    async (events: ParsedEvent[]) => events, // no transformation
  );

  for await (const event of eventGenerator) {
    const { blockTimestampMs, extrinsicHash } = event;
    const params = event.parsedParams;
    const cTypeHash = params.CtypeHashOf as HexString;

    let cTypeDetails: CType.ICTypeDetails;
    try {
      cTypeDetails = await CType.fetchFromChain(CType.hashToId(cTypeHash));
    } catch (exception) {
      logger.error(exception, `Error fetching CType ${cTypeHash}`);
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
