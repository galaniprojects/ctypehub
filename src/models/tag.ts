import type { ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, ModelAttributes, Sequelize } from 'sequelize';

export interface TagData {
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

export function initTag(sequelize: Sequelize) {
  Tag.init(TagModelDefinition, {
    sequelize,
    indexes: [{ fields: ['cTypeId'] }, { fields: ['tagName'] }],
  });
}
