import { beforeEach, describe, expect, it } from 'vitest';

import { getSnapshotHtmlForPath } from '../../../testing/getSnapshotHtmlForPath';
import { CType as CTypeModel } from '../../models/ctype';
import { mockCTypes } from '../../utilities/mockCTypes';
import { initializeDatabase } from '../../utilities/sequelize';
import { resetDatabase } from '../../../testing/resetDatabase';
import { Tag } from '../../models/tag';

beforeEach(async () => {
  await initializeDatabase();
  await resetDatabase();
  await CTypeModel.bulkCreate([
    mockCTypes.example,
    mockCTypes.nestedProperty,
    mockCTypes.hidden,
  ]);
  await Tag.create({ tagName: 'example', cTypeId: mockCTypes.example.id });
});

describe('index.astro', () => {
  it('should render all CTypes except hidden ones', async () => {
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

  it('should render tag results', async () => {
    const html = await getSnapshotHtmlForPath('?query=example');
    expect(html).toMatchSnapshot();
  });

  it('should render the tag page', async () => {
    const html = await getSnapshotHtmlForPath('/tag/example');
    expect(html).toMatchSnapshot();
  });
});
