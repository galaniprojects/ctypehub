import { CType } from '@kiltprotocol/sdk-js';

import { Op } from 'sequelize';

import { CType as CTypeModel } from '../models/ctype';

import { configuration } from './configuration';
import { sleep } from './sleep';
import { logger } from './logger';
import { subScanEventGenerator } from './subScan';

const SCAN_INTERVAL_MS = 10 * 60 * 1000;

const { isTest } = configuration;

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

  const fromBlock = latestCType ? Number(latestCType.dataValues.block) + 1 : 0;
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
      logger.error(exception, `Error fetching details for CType ${cTypeHash}`);
      continue;
    }

    const { $id, $schema, createdAt: block, ...rest } = cTypeDetails;

    await CTypeModel.upsert({
      id: $id,
      schema: $schema,
      createdAt: new Date(blockTimestampMs),
      extrinsicHash,
      block: block.toString(),
      ...rest,
    });
  }
}

export async function watchForCTypes() {
  while (!isTest) {
    await scanCTypes();
    await sleep(SCAN_INTERVAL_MS);
  }
}
