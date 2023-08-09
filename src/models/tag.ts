import type { ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, ModelAttributes, Sequelize } from 'sequelize';

export interface TagDataInput {
  cTypeId: ICType['$id'];
  tagName: string;
}

export interface TagData extends TagDataInput {
  search: string;
}

export class Tag extends Model<TagData, TagDataInput> {}

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

TagModelDefinition.search = {
  type: `tsvector generated always as (to_tsvector('english', "tagName")) stored`,
  set() {
    throw new Error('search is read-only');
  },
};

export function initTag(sequelize: Sequelize) {
  Tag.init(TagModelDefinition, {
    sequelize,
    indexes: [
      { fields: ['cTypeId'] },
      { fields: ['tagName'] },
      { fields: ['cTypeId', 'tagName'], unique: true },
    ],
  });
}
