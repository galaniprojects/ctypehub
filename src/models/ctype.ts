import type { DidUri, ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, ModelAttributes, Sequelize } from 'sequelize';

import { sequelize } from '../utilities/sequelize';

import { Attestation } from './attestation';
import { Tag } from './tag';

export interface CTypeDataInput extends Omit<ICType, '$id' | '$schema'> {
  id: ICType['$id'];
  schema: ICType['$schema'];
  creator: DidUri;
  createdAt: Date;
  extrinsicHash: string;
  block: string | null;
  description: string | null;
}

export interface CTypeData extends CTypeDataInput {
  attestationsCount: string;
  Tags?: Tag[];
}

export class CType extends Model<CTypeData, CTypeDataInput> {}

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

// Cannot be provided as a part of the scope, include it in queries manually
export const groupForAttestationsCount = ['CType.id', 'Attestations.cTypeId'];

CType.init(CTypeModelDefinition, {
  sequelize,

  scopes: {
    stats: {
      subQuery: false,
      // Attestation’s attributes array must be empty
      include: [{ model: Attestation, attributes: [] }],
      attributes: [
        // Unfortunately all the CType model’s fields have to be listed explicitly
        'id',
        'schema',
        'title',
        'description',
        'properties',
        'type',
        'creator',
        'createdAt',
        'extrinsicHash',
        'block',
        [
          Sequelize.fn('count', Sequelize.col('Attestations.claimHash')),
          'attestationsCount',
        ],
      ],
    },
  },
});

CType.hasMany(Attestation, { foreignKey: 'cTypeId' });
Attestation.belongsTo(CType, { foreignKey: 'cTypeId' });

CType.hasMany(Tag, { foreignKey: 'cTypeId' });
Tag.belongsTo(CType, { foreignKey: 'cTypeId' });

await sequelize.sync();
