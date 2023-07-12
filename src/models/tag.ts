import type { ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { sequelize } from '../utilities/sequelize';

interface TagData {
  cTypeId: ICType['$id'];
  tagName: string;
}

export class Tag extends Model<TagData> {}

const TagModelDefinition: ModelAttributes = {
  cTypeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  tagName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
};

Tag.init(TagModelDefinition, {
  sequelize,
  indexes: [{ fields: ['cTypeId', 'tagName'] }],
});
await sequelize.sync();
