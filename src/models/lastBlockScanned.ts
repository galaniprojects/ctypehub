import { DataTypes, Model, Sequelize } from 'sequelize';

export default class LastBlockScanned extends Model {
  declare value: number;

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
