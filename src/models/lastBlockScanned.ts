import { DataTypes, Model } from 'sequelize';

export class LastBlockScanned extends Model<{ value: number }> {}

export const LastBlockScannedModelDefinition = {
  value: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
};
