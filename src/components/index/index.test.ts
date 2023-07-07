import { beforeEach, describe, expect, it } from 'vitest';

import { getSnapshotHtmlForPath } from '../../../testing/getSnapshotHtmlForPath';
import { CType as CTypeModel } from '../../models/ctype';
import { mockCTypes } from '../../utilities/mockCTypes';
import { resetDatabase } from '../../../testing/resetDatabase';

beforeEach(async () => {
  await resetDatabase();
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
