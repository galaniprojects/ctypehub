import type { ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model } from 'sequelize';

interface CTypeData extends ICType {
  description: string;
}

export class CType extends Model<CTypeData> {}

export const CTypeModelDefinition = {
  $id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  $schema: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  properties: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
};
