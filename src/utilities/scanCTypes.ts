import { got } from 'got';

import { CType } from '@kiltprotocol/sdk-js';

import { CType as CTypeModel } from '../models/ctype';

import { configuration } from './configuration';
import { sleep } from './sleep';
import { logger } from './logger';

const SCAN_INTERVAL = 10 * 60 * 1000;
const SUBSCAN_MAX_ROWS = 100;

const { subscan } = configuration;

const endpoints = {
  metadata: `https://${subscan.host}/api/scan/metadata`,
  events: `https://${subscan.host}/api/scan/events`,
};

const apiKeyHeader = {
  'X-API-Key': subscan.secret,
};

async function getCTypeEvents(fromBlock: number, page: number, row: number) {
  const {
    data: { count, events },
  } = await got
    .post(endpoints.events, {
      headers: apiKeyHeader,
      json: {
        page,
        row,
        module: 'ctype',
        call: 'CTypeCreated',
        from_block: fromBlock,
        finalized: true,
      },
    })
    .json<{ data: { count: number; events: Array<{ params: string }> } }>();

  return { count, events };
}

export async function scanCTypes() {
  while (true) {
    const latestCType = await CTypeModel.findOne({
      order: [['block', 'DESC']],
    });

    const fromBlock = latestCType
      ? Number(latestCType.dataValues.block) + 1
      : 0;

    const { count } = await getCTypeEvents(fromBlock, 0, 1);

    logger.debug(`Found ${count} new CTypes`);

    if (count !== 0) {
      const pages = Math.ceil(count / SUBSCAN_MAX_ROWS);
      for (let page = 0; page < pages; page += 1) {
        const { events } = await getCTypeEvents(
          fromBlock,
          page,
          SUBSCAN_MAX_ROWS,
        );
        for (const { params } of events) {
          const parsed = JSON.parse(params) as [
            { type_name: 'CTypeCreatorOf'; value: `0x${string}` },
            { type_name: 'CTypeHashOf'; value: `0x${string}` },
          ];
          const cTypeDetails = await CType.fetchFromChain(
            CType.hashToId(parsed[1].value),
          );
          // TODO: populate database with CType details
        }
      }
    }

    await sleep(SCAN_INTERVAL);
  }
}
