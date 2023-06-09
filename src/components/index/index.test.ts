import { beforeEach, describe, expect, it } from '@jest/globals';

import { getSnapshotHtmlForPath } from '../../../testing/getSnapshotHtmlForPath';
import { CType as CTypeModel } from '../../models/ctype';
import { mockCTypes } from '../../utilities/mockCTypes';

beforeEach(async () => {
  await CTypeModel.destroy({ truncate: true });
  await CTypeModel.bulkCreate([mockCTypes.example, mockCTypes.nestedProperty]);
});

describe('index.astro', () => {
  it('should render all CTypes', async () => {
    const html = await getSnapshotHtmlForPath('');
    expect(html).toMatchSnapshot();
  });

  it('should render search results', async () => {
    const html = await getSnapshotHtmlForPath('?query=nested');
    expect(html).toMatchSnapshot();
  });
  it('should render when no search results', async () => {
    const html = await getSnapshotHtmlForPath('?query=asdagalasdg');
    expect(html).toMatchSnapshot();
  });
});
