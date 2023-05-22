/**
 * @jest-environment node
 */

import { beforeAll, afterAll, describe, expect, it } from '@jest/globals';

import {
  setup,
  teardown,
  getSnapshotHtmlForPath,
} from '../../../testing/integration.setup';

beforeAll(async () => {
  await setup();
}, 30_000);

afterAll(async () => {
  await teardown();
}, 10_000);

describe('CTypeOverview', () => {
  it('should match snapshot', async () => {
    const html = await getSnapshotHtmlForPath('ctype-example');
    expect(html).toMatchSnapshot();
  });
});
