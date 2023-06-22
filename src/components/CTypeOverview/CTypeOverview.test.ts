import { describe, expect, it } from 'vitest';

import { getSnapshotHtmlForPath } from '../../../testing/getSnapshotHtmlForPath';

describe('CTypeOverview', () => {
  it('should match snapshot', async () => {
    const html = await getSnapshotHtmlForPath('test/CTypeOverview-example');
    expect(html).toMatchSnapshot();
  });
});
