import { describe, expect, it } from 'vitest';

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
  it('should handle kitchen sink CType', async () => {
    const html = await getSnapshotHtmlForPath('test/CTypeDetails-everything');
    expect(html).toMatchSnapshot();
  });
  it('should handle hidden CType', async () => {
    const html = await getSnapshotHtmlForPath('test/CTypeDetails-hidden');
    expect(html).toMatchSnapshot();
  });
});
