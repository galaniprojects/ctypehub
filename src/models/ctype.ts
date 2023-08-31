import { type DidUri, type ICType } from '@kiltprotocol/sdk-js';
import { DataTypes, Model, type ModelAttributes, Sequelize } from 'sequelize';

import { Attestation } from './attestation';
import { Tag } from './tag';

interface CTypeDataInput extends Omit<ICType, '$id' | '$schema'> {
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
  isHidden: boolean;
  tags?: Pick<Tag, 'dataValues'>[];
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
  isHidden: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
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

export function initCType(sequelize: Sequelize) {
  CType.init(CTypeModelDefinition, {
    sequelize,

    scopes: {
      stats: {
        attributes: [
          // Unfortunately all the CType model’s fields have to be listed explicitly
          ...Object.keys(CTypeModelDefinition).filter(
            (key) => key !== 'search',
          ),
          [
            Sequelize.literal(
              `coalesce(
                (select count(*)
                from "Attestations"
                where "Attestations"."cTypeId" = "CType"."id"
                group by "CType"."id"),
                0)`,
            ),
            'attestationsCount',
          ],
        ],
      },
    },
  });

  CType.hasMany(Attestation, { foreignKey: 'cTypeId' });
  Attestation.belongsTo(CType, { foreignKey: 'cTypeId' });

  CType.hasMany(Tag, { foreignKey: 'cTypeId', as: 'tags' });
  Tag.belongsTo(CType, { foreignKey: 'cTypeId' });
}
