import { describe, expect, it } from '@jest/globals';

import { getSnapshotHtmlForPath } from '../../../testing/getSnapshotHtmlForPath';

describe('CTypeOverview', () => {
  it('should match snapshot', async () => {
    const html = await getSnapshotHtmlForPath('CTypeOverview-example');
    expect(html).toMatchSnapshot();
  });
});
