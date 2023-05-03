import { DataTypes, Model, Sequelize } from 'sequelize';

export class LastBlockScanned extends Model<{ value: number }> {
  static initTable(sequelize: Sequelize): void {
    LastBlockScanned.init(
      {
        value: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
      },
      { sequelize },
    );
  }
}
