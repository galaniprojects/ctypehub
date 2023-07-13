import { beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { mockCTypes } from '../utilities/mockCTypes';

import { resetDatabase } from '../../testing/resetDatabase';

import { CType } from './ctype';
import { Tag } from './tag';

beforeAll(async () => {
  const { sequelize } = await import('../utilities/sequelize');
  return async function teardown() {
    await sequelize.close();
  };
});

beforeEach(async () => {
  await resetDatabase();
});

describe('tags', () => {
  it('should associate tags with cTypes', async () => {
    const cType = await CType.create(mockCTypes.example);

    const cTypeId = cType.dataValues.id;
    const tags = await Tag.bulkCreate([
      { cTypeId, tagName: 'example' },
      { cTypeId, tagName: 'test' },
    ]);

    const foundCType = await CType.findByPk(mockCTypes.example.id, {
      include: { model: Tag, as: 'tags' },
    });

    if (!foundCType) {
      throw new Error('CType not found');
    }

    const cTypeTags = foundCType.dataValues.tags;

    expect(cTypeTags?.[0].dataValues).toMatchObject(tags[0].dataValues);
    expect(cTypeTags?.[1].dataValues).toMatchObject(tags[1].dataValues);
  });
});
