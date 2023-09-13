import { configuration } from './configuration';
import { scanCTypes } from './scanCTypes';
import { sleep } from './sleep';
import { scanAttestations } from './scanAttestations';

const { isTest } = configuration;

const SCAN_INTERVAL_MS = 10 * 60 * 1000;

export function watchSubScan() {
  if (isTest) {
    return;
  }
  (async () => {
    while (true) {
      await scanCTypes();
      await scanAttestations();
      await sleep(SCAN_INTERVAL_MS);
    }
  })();
}
