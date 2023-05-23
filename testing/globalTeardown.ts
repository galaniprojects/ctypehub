import process from 'node:process';

import { globalShared } from './globalShared';

export default async function teardown() {
  await new Promise<void>((resolve) => {
    globalShared.server.on('close', resolve);
    if (globalShared.server.pid) {
      process.kill(-globalShared.server.pid);
    }
  });
  await globalShared.blockchainContainer.stop();
  await globalShared.databaseContainer.stop();
}
