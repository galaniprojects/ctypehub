import type { IAttestation, ICType } from '@kiltprotocol/sdk-js';

import { DataTypes, Model, ModelAttributes } from 'sequelize';

import { sequelize } from '../utilities/sequelize';

import { CType } from './ctype';

export interface AttestationData
  extends Omit<IAttestation, 'cTypeHash' | 'revoked'> {
  cTypeId: ICType['$id'];
  createdAt: Date;
  extrinsicHash: string;
  block: string;
}

export class Attestation extends Model<AttestationData> {}

export const AttestationModelDefinition: ModelAttributes = {
  claimHash: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  cTypeId: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  owner: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  delegationId: {
    type: DataTypes.STRING,
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
};

Attestation.init(AttestationModelDefinition, {
  sequelize,
  indexes: [{ fields: ['cTypeId'] }],
});
Attestation.belongsTo(CType, { foreignKey: 'cTypeId' });
CType.hasMany(Attestation, { foreignKey: 'cTypeId' });

await sequelize.sync({ force: true });
