import type { ChildProcess } from 'node:child_process';
import type { StartedTestContainer } from 'testcontainers';

interface Shared {
  server: ChildProcess;
  blockchainContainer: StartedTestContainer;
  databaseContainer: StartedTestContainer;
}

export const globalShared = globalThis as unknown as Shared;
