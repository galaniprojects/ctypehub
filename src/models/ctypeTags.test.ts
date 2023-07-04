import type { Sequelize } from 'sequelize';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { mockCTypes } from '../utilities/mockCTypes';

import { CType } from './ctype';
import { Tag } from './tag';

let sequelize: Sequelize;

beforeAll(async () => {
  sequelize = (await import('../utilities/sequelize')).sequelize;
  await CType.destroy({ where: {} });
  await Tag.destroy({ where: {} });
});

afterAll(async () => {
  await sequelize.close();
});

describe('ctypeTags', () => {
  it('should associate tags with cTypes', async () => {
    const cType = await CType.create(mockCTypes.example);
    const tags = await Tag.bulkCreate([{ name: 'example' }, { name: 'test' }]);
    await cType.addTags(tags);

    const foundCType = await CType.findByPk(mockCTypes.example.id, {
      include: [Tag],
    });

    if (!foundCType) {
      throw new Error('CType not found');
    }

    expect(foundCType.Tags?.[0].dataValues).toMatchObject(tags[0].dataValues);
    expect(foundCType.Tags?.[1].dataValues).toMatchObject(tags[1].dataValues);

    const foundTag = await Tag.findByPk('example', { include: [CType] });

    if (!foundTag) {
      throw new Error('Tag not found');
    }

    expect(foundTag.CTypes[0].dataValues).toMatchObject(cType.dataValues);
  });
});
