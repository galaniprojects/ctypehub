import type { DidUri, ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { sequelize } from '../utilities/sequelize';

export interface CTypeData extends Omit<ICType, '$id' | '$schema'> {
  id: ICType['$id'];
  schema: ICType['$schema'];
  creator: DidUri;
  createdAt: Date;
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

const fields = Object.keys(CTypeModelDefinition)
  .filter((name) => name !== 'createdAt')
  .map((name) => `coalesce("${name}"::text, '')`)
  .join(` || ' ' || `);

CTypeModelDefinition.search = {
  type: `tsvector generated always as (to_tsvector('english', ${fields})) stored`,
  set() {
    throw new Error('search is read-only');
  },
};

CType.init(CTypeModelDefinition, { sequelize });
sequelize.sync();
