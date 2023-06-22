import { expect, vi } from 'vitest';

import vueSnapshotSerializer from 'jest-serializer-vue';

expect.addSnapshotSerializer(vueSnapshotSerializer);

vi.mock('../src/utilities/configuration', () => ({
  configuration: {
    port: 3000,
    isProduction: false,
    isTest: true,
    databaseUri: import.meta.env.DATABASE_URI,
    blockchainEndpoint: import.meta.env.BLOCKCHAIN_ENDPOINT,
    subscan: {
      network: 'example',
      secret: 'SECRET_SUBSCAN',
    },
  },
}));
