import { type IAttestation, type ICType } from '@kiltprotocol/sdk-js';
import {
  DataTypes,
  Model,
  type ModelAttributes,
  type Sequelize,
} from 'sequelize';

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

export function initAttestation(sequelize: Sequelize) {
  Attestation.init(AttestationModelDefinition, {
    sequelize,
    indexes: [{ fields: ['cTypeId'] }],
  });
}
