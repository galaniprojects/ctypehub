import { configuration } from '../configuration';
import { sleep } from '../sleep';

import { queryCTypes } from './queryCTypes';

const { isTest } = configuration;

const SCAN_INTERVAL_MS = 10 * 60 * 1000;

export function watchIndexer() {
  if (isTest) {
    return;
  }
  (async () => {
    while (true) {
      await queryCTypes();
      await sleep(SCAN_INTERVAL_MS);
    }
  })();
}
