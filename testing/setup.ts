import { expect, vi } from 'vitest';

import vueSnapshotSerializer from 'jest-serializer-vue';

import * as envMock from './env';

expect.addSnapshotSerializer(vueSnapshotSerializer);

vi.mock('../src/utilities/env', () => envMock);
