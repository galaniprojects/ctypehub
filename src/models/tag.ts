import type { CType } from './ctype';

import { DataTypes, Model, ModelAttributes } from 'sequelize';

export interface TagData {
  name: string;
}

export class Tag extends Model<TagData> {
  declare CTypes: CType[];
}

export const TagModelDefinition: ModelAttributes = {
  name: {
    type: DataTypes.STRING,
    primaryKey: true,
    allowNull: false,
    unique: true,
  },
};
