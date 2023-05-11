import type { ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, ModelAttributes } from 'sequelize';

interface CTypeData extends Omit<ICType, '$id' | '$schema'> {
  id: ICType['$id'];
  schema: ICType['$schema'];
  creator: string;
  createdAt: number;
  extrinsicHash: string;
  block: string | null;
  description: string | null;
}

export class CType extends Model<CTypeData> {}

export const CTypeModelDefinition: ModelAttributes = {
  id: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  schema: {
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
  creator: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  extrinsicHash: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  block: {
    type: DataTypes.STRING,
  },
  description: {
    type: DataTypes.STRING,
  },
};
