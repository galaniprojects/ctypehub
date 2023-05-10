import { got } from 'got';

import { CType } from '@kiltprotocol/sdk-js';

import { CType as CTypeModel } from '../models/ctype';

import { configuration } from './configuration';
import { sleep } from './sleep';
import { logger } from './logger';

const SCAN_INTERVAL_MS = 10 * 60 * 1000;

const SUBSCAN_MAX_ROWS = 100;

const { subscan } = configuration;

const endpoints = {
  metadata: `https://${subscan.host}/api/scan/metadata`,
  events: `https://${subscan.host}/api/scan/events`,
};

const apiKeyHeader = {
  'X-API-Key': subscan.secret,
};

interface EventsResponseJson {
  data: {
    count: number;
    events: Array<{ params: string; block_timestamp: number }>;
  };
}

export type EventParams = [
  { type_name: 'CTypeCreatorOf'; value: `0x${string}` },
  { type_name: 'CTypeHashOf'; value: `0x${string}` },
];

interface CTypeEvent {
  blockTimestampMs: number;
  hash: `0x${string}`;
}

export async function getCTypeEvents(
  fromBlock: number,
  page: number,
  row: number,
): Promise<{ count: number; events: CTypeEvent[] }> {
  const json = {
    page,
    row,
    module: 'ctype',
    call: 'CTypeCreated',
    from_block: fromBlock,
    finalized: true,
  };

  const {
    data: { count, events },
  } = await got
    .post(endpoints.events, {
      headers: apiKeyHeader,
      json,
    })
    .json<EventsResponseJson>();

  const parsedEvents: CTypeEvent[] = events.map(
    ({ block_timestamp, params }) => {
      const eventParams = JSON.parse(params) as EventParams;
      return {
        blockTimestampMs: block_timestamp * 1000,
        hash: eventParams[1].value,
      };
    },
  );

  return { count, events: parsedEvents };
}

export async function scanCTypes() {
  const latestCType = await CTypeModel.findOne({
    order: [['createdAt', 'DESC']],
    where: {
      isFromSubscan: true,
    },
  });

  const fromBlock = latestCType ? Number(latestCType.dataValues.block) + 1 : 0;

  const { count } = await getCTypeEvents(fromBlock, 0, 1);

  if (count === 0) {
    logger.debug('No new CTypes found');
    return;
  }

  logger.debug(`Found ${count} new CTypes`);

  const pages = Math.ceil(count / SUBSCAN_MAX_ROWS);
  for (let page = 0; page < pages; page += 1) {
    const { events } = await getCTypeEvents(fromBlock, page, SUBSCAN_MAX_ROWS);
    for (const { blockTimestampMs, hash } of events) {
      let cTypeDetails: CType.ICTypeDetails;

      try {
        cTypeDetails = await CType.fetchFromChain(CType.hashToId(hash));
      } catch (exception) {
        logger.error(exception, `Error fetching details for CType ${hash}`);
        continue;
      }

      const { $id, $schema, createdAt: block, ...rest } = cTypeDetails;

      await CTypeModel.upsert({
        id: $id,
        schema: $schema,
        block: block.toString(),
        createdAt: blockTimestampMs,
        isFromSubscan: true,
        ...rest,
      });
    }
  }
}

export async function watchForCTypes() {
  while (true) {
    await scanCTypes();
    await sleep(SCAN_INTERVAL_MS);
  }
}
