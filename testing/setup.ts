import { expect, vi } from 'vitest';

import vueSnapshotSerializer from 'jest-serializer-vue';

expect.addSnapshotSerializer(
  vueSnapshotSerializer as Parameters<typeof expect.addSnapshotSerializer>[0],
);

vi.mock('../src/utilities/configuration', () => ({
  configuration: {
    port: 3000,
    isProduction: false,
    isTest: true,
    databaseUri: import.meta.env.DATABASE_URI as string,
    blockchainEndpoint: import.meta.env.BLOCKCHAIN_ENDPOINT as string,
    subscan: {
      network: 'example',
      secret: 'SECRET_SUBSCAN',
    },
  },
}));
