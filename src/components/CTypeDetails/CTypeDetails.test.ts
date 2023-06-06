import { describe, expect, it } from '@jest/globals';

import { getSnapshotHtmlForPath } from '../../../testing/getSnapshotHtmlForPath';

describe('CTypeDetails', () => {
  it('should match snapshot', async () => {
    const html = await getSnapshotHtmlForPath('test/CTypeDetails-example');
    expect(html).toMatchSnapshot();
  });
  it('should handle nested CType property', async () => {
    const html = await getSnapshotHtmlForPath(
      'test/CTypeDetails-nestedProperty',
    );
    expect(html).toMatchSnapshot();
  });
  it('should handle nested CType', async () => {
    const html = await getSnapshotHtmlForPath('test/CTypeDetails-nestedCType');
    expect(html).toMatchSnapshot();
  });
});
